const { all, get, run } = require("../db/query");

function minuti(orario) {
  const parti = String(orario || "").split(":").slice(0, 2).map(Number);
  if (parti.length < 2 || parti.some((parte) => Number.isNaN(parte))) {
    return null;
  }
  const [ore, min] = parti;
  if (ore < 0 || ore > 23 || min < 0 || min > 59) return null;
  return ore * 60 + min;
}

function orarioDaMinuti(minutiTotali) {
  const ore = String(Math.floor(minutiTotali / 60)).padStart(2, "0");
  const min = String(minutiTotali % 60).padStart(2, "0");
  return `${ore}:${min}`;
}

function normalizzaData(data) {
  return String(data || "").slice(0, 10);
}

function slotPrenotabilePerData(data, orario) {
  const dataNorm = normalizzaData(data);
  const oggi = dataLocale();
  if (dataNorm < oggi) return false;
  if (dataNorm > oggi) return true;

  return new Date(`${dataNorm}T${orario}:00`) > new Date();
}

function dataLocale(data = new Date()) {
  const anno = data.getFullYear();
  const mese = String(data.getMonth() + 1).padStart(2, "0");
  const giorno = String(data.getDate()).padStart(2, "0");
  return `${anno}-${mese}-${giorno}`;
}

async function idMateria(nome) {
  await run(`INSERT OR IGNORE INTO Materie (nome) VALUES (?)`, [nome]);
  const row = await get(`SELECT id FROM Materie WHERE nome = ?`, [nome]);
  return row.id;
}

async function idLingua(nome) {
  await run(`INSERT OR IGNORE INTO Lingue (nome) VALUES (?)`, [nome]);
  const row = await get(`SELECT id FROM Lingue WHERE nome = ?`, [nome]);
  return row.id;
}

function mappaTutor(row) {
  const subjects = row.subjects ? row.subjects.split(",").filter(Boolean) : [];
  const languages = row.languages ? row.languages.split(",").filter(Boolean) : [];
  const subjectOptions = row.subjectOptions
    ? row.subjectOptions
        .split(",")
        .filter(Boolean)
        .map((item) => {
          const [id, ...nameParts] = item.split(":");
          return { id: Number(id), nome: nameParts.join(":") };
        })
    : [];

  return {
    id: row.id,
    name: `${row.nome} ${row.cognome}`,
    nome: row.nome,
    cognome: row.cognome,
    email: row.email,
    bio: row.bio_tutor || "",
    subjects,
    subjectOptions,
    languages,
    rating: Number(row.rating || 0).toFixed(1),
    reviews: Number(row.reviews || 0),
    price: Number(row.price || 0),
    image: row.immagine_profilo || immagineProfiloPredefinita(row),
    disponibileDal: row.disponibileDal,
    disponibileAl: row.disponibileAl,
  };
}

function immagineProfiloPredefinita(row) {
  const nome = encodeURIComponent(
    `${row.nome || "Tutor"} ${row.cognome || ""}`.trim(),
  );
  return `https://ui-avatars.com/api/?name=${nome}&background=1e40af&color=fff`;
}

const Platform = {
  async getCurrentUser(userId) {
    const user = await get(
      `
        SELECT id, nome, cognome, email, immagine_profilo, stato,
               tipologia_utente, data_iscrizione
        FROM Utente
        WHERE id = ?
      `,
      [userId],
    );

    if (!user) return null;

    if (user.tipologia_utente === "studente") {
      const studente = await get(
        `SELECT bio_studente FROM Studente WHERE utente_id = ?`,
        [userId],
      );
      user.bio = studente?.bio_studente || "";
    }

    if (user.tipologia_utente === "tutor") {
      const tutor = await get(`SELECT bio_tutor FROM Tutor WHERE utente_id = ?`, [
        userId,
      ]);
      user.bio = tutor?.bio_tutor || "";
    }

    return user;
  },

  async getUserSummary(userId) {
    return get(
      `
        SELECT id, nome, cognome, email, immagine_profilo, tipologia_utente
        FROM Utente
        WHERE id = ? AND stato = 'attivo'
      `,
      [userId],
    );
  },

  async updateCurrentUser(userId, data) {
    if (data.nome || data.cognome || data.immagine_profilo !== undefined) {
      const current = await this.getCurrentUser(userId);
      await run(
        `
          UPDATE Utente
          SET nome = ?, cognome = ?, immagine_profilo = ?
          WHERE id = ?
        `,
        [
          data.nome || current.nome,
          data.cognome || current.cognome,
          data.immagine_profilo !== undefined
            ? data.immagine_profilo
            : current.immagine_profilo,
          userId,
        ],
      );
    }

    if (data.bio !== undefined) {
      const user = await this.getCurrentUser(userId);
      if (user.tipologia_utente === "studente") {
        await run(`UPDATE Studente SET bio_studente = ? WHERE utente_id = ?`, [
          data.bio,
          userId,
        ]);
      } else if (user.tipologia_utente === "tutor") {
        await run(`UPDATE Tutor SET bio_tutor = ? WHERE utente_id = ?`, [
          data.bio,
          userId,
        ]);
      }
    }

    return this.getCurrentUser(userId);
  },

  async searchTutors(filtri = {}) {
    const rows = await all(`
      SELECT
        u.id,
        u.nome,
        u.cognome,
        u.email,
        u.immagine_profilo,
        t.bio_tutor,
        COALESCE(t.media_recensioni, 0) AS rating,
        COUNT(DISTINCT r.id) AS reviews,
        COALESCE(MIN(dt.tariffa_oraria), 0) AS price,
        MIN(dt.data) AS disponibileDal,
        MAX(dt.data) AS disponibileAl,
        GROUP_CONCAT(DISTINCT m.nome) AS subjects,
        GROUP_CONCAT(DISTINCT m.id || ':' || m.nome) AS subjectOptions,
        GROUP_CONCAT(DISTINCT l.nome) AS languages
      FROM Tutor t
      JOIN Utente u ON u.id = t.utente_id
      LEFT JOIN Tutor_Materie tm ON tm.tutor_id = t.utente_id
      LEFT JOIN Materie m ON m.id = tm.materia_id
      LEFT JOIN Tutor_Lingue tl ON tl.tutor_id = t.utente_id
      LEFT JOIN Lingue l ON l.id = tl.lingua_id
      LEFT JOIN Disponibilita_Tutor dt
        ON dt.tutor_id = t.utente_id
       AND COALESCE(dt.eliminato, 0) = 0
      LEFT JOIN Recensione r ON r.tutor_id = t.utente_id
      WHERE u.stato = 'attivo'
      GROUP BY u.id
    `);

    return rows.map(mappaTutor).filter((tutor) => {
      if (!filtri.includeWithoutSubjects && tutor.subjects.length === 0) {
        return false;
      }

      const testo = (filtri.testo || "").toLowerCase();
      if (testo && !tutor.name.toLowerCase().includes(testo)) return false;
      if (
        filtri.materie?.length &&
        !filtri.materie.some((materia) => tutor.subjects.includes(materia))
      ) {
        return false;
      }
      if (
        filtri.lingue?.length &&
        !filtri.lingue.some((lingua) => tutor.languages.includes(lingua))
      ) {
        return false;
      }
      if (filtri.prezzoMin !== undefined && tutor.price < filtri.prezzoMin) {
        return false;
      }
      if (filtri.prezzoMax !== undefined && tutor.price > filtri.prezzoMax) {
        return false;
      }
      if (filtri.dataDa && tutor.disponibileAl && tutor.disponibileAl < filtri.dataDa) {
        return false;
      }
      if (filtri.dataA && tutor.disponibileDal && tutor.disponibileDal > filtri.dataA) {
        return false;
      }
      return true;
    });
  },

  async getTutorSubjects(tutorId) {
    return all(
      `
        SELECT m.id, m.nome
        FROM Tutor_Materie tm
        JOIN Materie m ON m.id = tm.materia_id
        WHERE tm.tutor_id = ?
        ORDER BY m.nome ASC
      `,
      [tutorId],
    );
  },

  async getTutorById(tutorId) {
    const tutors = await this.searchTutors({ includeWithoutSubjects: true });
    const tutor = tutors.find((item) => Number(item.id) === Number(tutorId));
    if (!tutor) return null;

    const subjectOptions = await this.getTutorSubjects(tutorId);
    tutor.subjectOptions = subjectOptions;
    tutor.subjects = subjectOptions.map((materia) => materia.nome);

    return tutor;
  },

  async getAvailability(tutorId) {
    return all(
      `
        SELECT MIN(dt.id) AS id, dt.data, dt.giorno_settimana, dt.ora_inizio, dt.ora_fine,
               dt.tariffa_oraria, m.id AS materia_id, m.nome AS materia
        FROM Disponibilita_Tutor dt
        JOIN Materie m ON m.id = dt.materia_id
        WHERE dt.tutor_id = ?
          AND COALESCE(dt.eliminato, 0) = 0
        GROUP BY dt.data, dt.giorno_settimana, dt.ora_inizio, dt.ora_fine,
                 dt.tariffa_oraria, m.id, m.nome
        ORDER BY dt.data ASC, dt.ora_inizio ASC
      `,
      [tutorId],
    );
  },

  async getBookedSlots(tutorId, studenteId = null) {
    const params = [tutorId];
    let filtroStudente = "";

    if (studenteId) {
      filtroStudente = " OR studente_id = ?";
      params.push(studenteId);
    }

    return all(
      `
        SELECT id, disponibilita_id, materia_id, data, ora_inizio, ora_fine,
               tutor_id, studente_id
        FROM Prenotazioni
        WHERE tutor_id = ?${filtroStudente}
        ORDER BY data ASC, ora_inizio ASC
      `,
      params,
    );
  },

  async getAvailableSchedule(tutorId, studenteId = null) {
    const [availability, bookedSlots] = await Promise.all([
      this.getAvailability(tutorId),
      this.getBookedSlots(tutorId, studenteId),
    ]);

    const fasceUniche = new Map();
    for (const fascia of availability) {
      const data = normalizzaData(fascia.data);
      const inizioMinuti = minuti(fascia.ora_inizio);
      const fineMinuti = minuti(fascia.ora_fine);

      if (!data || inizioMinuti === null || fineMinuti === null) continue;
      if (inizioMinuti >= fineMinuti) continue;

      const inizio = orarioDaMinuti(inizioMinuti);
      const fine = orarioDaMinuti(fineMinuti);
      const chiave = `${data}|${inizio}|${fine}`;
      if (!fasceUniche.has(chiave)) {
        fasceUniche.set(chiave, {
          data,
          disponibilita_id: fascia.id,
          ora_inizio: inizio,
          ora_fine: fine,
          availableStarts: [],
          availableEndsByStart: {},
        });
      }
    }

    const prenotazioni = bookedSlots.map((slot) => ({
      data: normalizzaData(slot.data),
      inizio: minuti(slot.ora_inizio),
      fine: minuti(slot.ora_fine),
    }));

    for (const fascia of fasceUniche.values()) {
      const inizioFascia = minuti(fascia.ora_inizio);
      const fineFascia = minuti(fascia.ora_fine);
      if (inizioFascia === null || fineFascia === null) continue;

      for (let start = inizioFascia; start + 30 <= fineFascia; start += 30) {
        const oraInizio = orarioDaMinuti(start);
        const oraFineMinima = orarioDaMinuti(start + 30);

        if (!slotPrenotabilePerData(fascia.data, oraInizio)) continue;
        if (
          prenotazioni.some(
            (slot) =>
              slot.data === fascia.data &&
              slot.inizio !== null &&
              slot.fine !== null &&
              slot.inizio < start + 30 &&
              slot.fine > start,
          )
        ) {
          continue;
        }

        const finiDisponibili = [];
        for (let end = start + 30; end <= fineFascia; end += 30) {
          const occupato = prenotazioni.some(
            (slot) =>
              slot.data === fascia.data &&
              slot.inizio !== null &&
              slot.fine !== null &&
              slot.inizio < end &&
              slot.fine > start,
          );

          if (occupato) break;
          finiDisponibili.push(orarioDaMinuti(end));
        }

        if (finiDisponibili.length > 0) {
          fascia.availableStarts.push(oraInizio);
          fascia.availableEndsByStart[oraInizio] = finiDisponibili;
        }
      }

      if (fascia.availableStarts.length === 0) {
        fasceUniche.delete(
          `${fascia.data}|${fascia.ora_inizio}|${fascia.ora_fine}`,
        );
      }
    }

    return Array.from(fasceUniche.values()).sort((a, b) =>
      `${a.data} ${a.ora_inizio}`.localeCompare(`${b.data} ${b.ora_inizio}`),
    );
  },

  async replaceAvailability(tutorId, disponibilita = [], tariffaOraria = 0) {
    const tutorMaterie = await all(
      `SELECT materia_id FROM Tutor_Materie WHERE tutor_id = ?`,
      [tutorId],
    );
    if (tutorMaterie.length === 0) {
      return { noSubjects: true };
    }

    const materiaIds = tutorMaterie.map((row) => row.materia_id);

    for (const item of disponibilita) {
      if (!item.attivo) continue;
      const data = item.data;
      const oraInizio = item.dalle || item.ora_inizio;
      const oraFine = item.alle || item.ora_fine;
      const inizioMinuti = minuti(oraInizio);
      const fineMinuti = minuti(oraFine);

      if (!data || data < dataLocale()) return { invalidPastDate: true };
      if (
        inizioMinuti === null ||
        fineMinuti === null ||
        inizioMinuti >= fineMinuti
      ) {
        return { invalidTime: true };
      }
    }

    await run(
      `UPDATE Disponibilita_Tutor SET eliminato = 1 WHERE tutor_id = ?`,
      [tutorId],
    );

    await run(
      `
        DELETE FROM Disponibilita_Tutor
        WHERE tutor_id = ?
          AND COALESCE(eliminato, 0) = 1
          AND id NOT IN (
            SELECT DISTINCT disponibilita_id
            FROM Prenotazioni
            WHERE disponibilita_id IS NOT NULL
          )
      `,
      [tutorId],
    );

    for (const item of disponibilita) {
      if (!item.attivo) continue;
      const data = item.data;
      const idsDaSalvare = item.materia_id ? [item.materia_id] : materiaIds;

      for (const materiaId of idsDaSalvare) {
        await run(
          `
            INSERT INTO Disponibilita_Tutor
            (tutor_id, materia_id, data, giorno_settimana, ora_inizio, ora_fine, tariffa_oraria, eliminato)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)
          `,
          [
            tutorId,
            materiaId,
            data,
            item.giorno_settimana || data || "da definire",
            item.dalle || item.ora_inizio,
            item.alle || item.ora_fine,
            tariffaOraria || item.tariffa_oraria || 0,
          ],
        );
      }
    }

    return this.getAvailability(tutorId);
  },

  async updateTutorProfile(tutorId, data) {
    if (data.bio !== undefined) {
      await run(`UPDATE Tutor SET bio_tutor = ? WHERE utente_id = ?`, [
        data.bio,
        tutorId,
      ]);
    }

    if (data.nome || data.cognome || data.immagine_profilo !== undefined) {
      await this.updateCurrentUser(tutorId, data);
    }

    if (Array.isArray(data.materie)) {
      await run(`DELETE FROM Tutor_Materie WHERE tutor_id = ?`, [tutorId]);
      for (const materia of data.materie) {
        const materiaId = await idMateria(materia);
        await run(
          `INSERT OR IGNORE INTO Tutor_Materie (tutor_id, materia_id) VALUES (?, ?)`,
          [tutorId, materiaId],
        );
      }

      if (data.materie.length === 0) {
        await run(
          `UPDATE Disponibilita_Tutor SET eliminato = 1 WHERE tutor_id = ?`,
          [tutorId],
        );
        await run(
          `
            DELETE FROM Disponibilita_Tutor
            WHERE tutor_id = ?
              AND COALESCE(eliminato, 0) = 1
              AND id NOT IN (
                SELECT DISTINCT disponibilita_id
                FROM Prenotazioni
                WHERE disponibilita_id IS NOT NULL
              )
          `,
          [tutorId],
        );
      }
    }

    if (Array.isArray(data.lingue)) {
      await run(`DELETE FROM Tutor_Lingue WHERE tutor_id = ?`, [tutorId]);
      for (const lingua of data.lingue) {
        const linguaId = await idLingua(lingua);
        await run(
          `INSERT OR IGNORE INTO Tutor_Lingue (tutor_id, lingua_id) VALUES (?, ?)`,
          [tutorId, linguaId],
        );
      }
    }

    return this.getTutorById(tutorId);
  },

  async getTutorMaterials(tutorId, studenteId = null) {
    return all(
      `
        SELECT md.id, md.titolo, md.descrizione, md.file_url,
               md.anteprima_url, md.copertina_url,
               md.importo, m.nome AS materia,
               EXISTS(
                 SELECT 1
                 FROM Materiale_Acquistato ma
                 WHERE ma.materiale_id = md.id
                   AND ma.studente_id = ?
               ) AS acquistato
        FROM Materiale_Didattico md
        JOIN Materie m ON m.id = md.materia_id
        WHERE md.tutor_id = ?
          AND COALESCE(md.eliminato, 0) = 0
        GROUP BY md.id, md.titolo, md.descrizione, md.file_url, md.anteprima_url,
                 md.copertina_url, md.importo, m.nome
        ORDER BY md.id DESC
      `,
      [studenteId || 0, tutorId],
    );
  },

  async createMaterial(tutorId, data) {
    const materiaId = data.materia ? await idMateria(data.materia) : null;
    const fallback = await get(
      `SELECT materia_id FROM Tutor_Materie WHERE tutor_id = ? LIMIT 1`,
      [tutorId],
    );
    const result = await run(
      `
        INSERT INTO Materiale_Didattico
        (tutor_id, materia_id, titolo, descrizione, file_url, anteprima_url, copertina_url, importo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tutorId,
        materiaId || fallback?.materia_id || (await idMateria("Matematica")),
        data.titolo,
        data.descrizione || "",
        data.file_url || "",
        data.anteprima_url || "",
        data.copertina_url || "",
        Number(data.importo) || 0,
      ],
    );
    return get(`SELECT * FROM Materiale_Didattico WHERE id = ?`, [result.id]);
  },

  async purchaseMaterial(studenteId, materialeId) {
    const materiale = await get(
      `SELECT * FROM Materiale_Didattico WHERE id = ? AND COALESCE(eliminato, 0) = 0`,
      [materialeId],
    );
    if (!materiale) return null;

    const acquistoEsistente = await get(
      `
        SELECT id
        FROM Materiale_Acquistato
        WHERE studente_id = ? AND materiale_id = ?
      `,
      [studenteId, materialeId],
    );

    if (acquistoEsistente) {
      return { alreadyPurchased: true, material: materiale };
    }

    await run(
      `
        INSERT INTO Materiale_Acquistato
        (studente_id, materiale_id, importo_pagato)
        VALUES (?, ?, ?)
      `,
      [studenteId, materialeId, materiale.importo],
    );
    return materiale;
  },

  async deleteMaterial(tutorId, materialeId) {
    const materiale = await get(
      `SELECT id FROM Materiale_Didattico WHERE id = ? AND tutor_id = ?`,
      [materialeId, tutorId],
    );
    if (!materiale) return null;

    await run(
      `UPDATE Materiale_Didattico SET eliminato = 1 WHERE id = ? AND tutor_id = ?`,
      [materialeId, tutorId],
    );
    return { ok: true };
  },

  async getPurchasedMaterials(studenteId) {
    return all(
      `
        SELECT ma.id, ma.data_acquisto, ma.importo_pagato,
               md.titolo, md.descrizione, md.file_url, md.anteprima_url,
               md.copertina_url, md.importo,
               u.nome || ' ' || u.cognome AS autore
        FROM Materiale_Acquistato ma
        JOIN Materiale_Didattico md ON md.id = ma.materiale_id
        JOIN Utente u ON u.id = md.tutor_id
        WHERE ma.studente_id = ?
        ORDER BY ma.data_acquisto DESC
      `,
      [studenteId],
    );
  },

  async createBooking(studenteId, data) {
    const disponibilitaRichiesta = await get(
      `
        SELECT *
        FROM Disponibilita_Tutor
        WHERE id = ?
          AND COALESCE(eliminato, 0) = 0
      `,
      [data.disponibilita_id],
    );
    if (!disponibilitaRichiesta) return null;

    const inizioMinuti = minuti(data.ora_inizio);
    const fineMinuti = minuti(data.ora_fine);
    if (inizioMinuti === null || fineMinuti === null || inizioMinuti >= fineMinuti) {
      return { invalidSlot: true };
    }

    const inizioPrenotazione = new Date(`${data.data}T${data.ora_inizio}:00`);
    if (inizioPrenotazione <= new Date()) {
      return { invalidTime: true };
    }

    const materiaId = Number(data.materia_id || disponibilitaRichiesta.materia_id);
    const materiaTutor = await get(
      `
        SELECT 1
        FROM Tutor_Materie
        WHERE tutor_id = ? AND materia_id = ?
      `,
      [disponibilitaRichiesta.tutor_id, materiaId],
    );

    if (!materiaTutor) return { invalidSubject: true };

    const disponibilita = await get(
      `
        SELECT *
        FROM Disponibilita_Tutor
        WHERE tutor_id = ?
          AND data = ?
          AND ora_inizio <= ?
          AND ora_fine >= ?
          AND COALESCE(eliminato, 0) = 0
        LIMIT 1
      `,
      [
        disponibilitaRichiesta.tutor_id,
        data.data,
        data.ora_inizio,
        data.ora_fine,
      ],
    );

    if (!disponibilita) return { invalidSlot: true };

    const conflitto = await get(
      `
        SELECT id
        FROM Prenotazioni
        WHERE data = ?
          AND (studente_id = ? OR tutor_id = ?)
          AND ora_inizio < ?
          AND ora_fine > ?
        LIMIT 1
      `,
      [
        data.data,
        studenteId,
        disponibilita.tutor_id,
        data.ora_fine,
        data.ora_inizio,
      ],
    );

    if (conflitto) {
      return { conflict: true };
    }

    const ore =
      (Number(data.ora_fine.split(":")[0]) * 60 +
        Number(data.ora_fine.split(":")[1]) -
        (Number(data.ora_inizio.split(":")[0]) * 60 +
          Number(data.ora_inizio.split(":")[1]))) /
      60;
    const importo = Math.max(0, ore * disponibilita.tariffa_oraria);

    const result = await run(
      `
        INSERT INTO Prenotazioni
        (disponibilita_id, studente_id, tutor_id, materia_id, data, ora_inizio, ora_fine, importo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        disponibilita.id,
        studenteId,
        disponibilita.tutor_id,
        materiaId,
        data.data,
        data.ora_inizio,
        data.ora_fine,
        importo,
      ],
    );

    return get(`SELECT * FROM Prenotazioni WHERE id = ?`, [result.id]);
  },

  async getBookingsForUser(userId, ruolo) {
    const field = ruolo === "tutor" ? "p.tutor_id" : "p.studente_id";
    return all(
      `
        SELECT p.*, m.nome AS materia,
               tutor.nome || ' ' || tutor.cognome AS tutorName,
               tutor.immagine_profilo AS tutorAvatar,
               stud.nome || ' ' || stud.cognome AS studentName,
               EXISTS(
                 SELECT 1 FROM Recensione r
                 WHERE r.studente_id = p.studente_id AND r.tutor_id = p.tutor_id
               ) AS hasReviewed
        FROM Prenotazioni p
        JOIN Materie m ON m.id = p.materia_id
        JOIN Utente tutor ON tutor.id = p.tutor_id
        JOIN Utente stud ON stud.id = p.studente_id
        WHERE ${field} = ?
        ORDER BY
          CASE
            WHEN datetime(p.data || ' ' || p.ora_inizio) >= datetime('now', 'localtime')
            THEN 0
            ELSE 1
          END,
          CASE
            WHEN datetime(p.data || ' ' || p.ora_inizio) >= datetime('now', 'localtime')
            THEN datetime(p.data || ' ' || p.ora_inizio)
          END ASC,
          CASE
            WHEN datetime(p.data || ' ' || p.ora_inizio) < datetime('now', 'localtime')
            THEN datetime(p.data || ' ' || p.ora_inizio)
          END DESC
      `,
      [userId],
    );
  },

  async createReview(studenteId, data) {
    const booking = await get(`SELECT * FROM Prenotazioni WHERE id = ?`, [
      data.prenotazione_id,
    ]);
    if (!booking || Number(booking.studente_id) !== Number(studenteId)) {
      return null;
    }

    const voto = Number(data.voto);
    if (!Number.isInteger(voto) || voto < 1 || voto > 5) {
      return { invalidVote: true };
    }

    const lezioneConclusa = await get(
      `
        SELECT 1
        WHERE datetime(? || ' ' || ?) <= datetime('now', 'localtime')
      `,
      [booking.data, booking.ora_fine],
    );

    if (!lezioneConclusa) {
      return { lessonNotCompleted: true };
    }

    const recensioneEsistente = await get(
      `
        SELECT id
        FROM Recensione
        WHERE studente_id = ?
          AND tutor_id = ?
        LIMIT 1
      `,
      [studenteId, booking.tutor_id],
    );

    if (recensioneEsistente) {
      return { duplicateReview: true };
    }

    await run(
      `
        INSERT INTO Recensione (studente_id, tutor_id, voto, commento)
        VALUES (?, ?, ?, ?)
      `,
      [studenteId, booking.tutor_id, voto, data.commento || ""],
    );

    await run(
      `
        UPDATE Tutor
        SET media_recensioni = (
          SELECT AVG(voto) FROM Recensione WHERE tutor_id = ?
        )
        WHERE utente_id = ?
      `,
      [booking.tutor_id, booking.tutor_id],
    );

    return this.getBookingsForUser(studenteId, "studente");
  },

  async getConversations(userId) {
    return all(
      `
        SELECT
          u.id,
          u.nome,
          u.cognome,
          u.email,
          u.immagine_profilo,
          MAX(msg.data_invio) AS lastMessageTime,
          (
            SELECT contenuto
            FROM Messaggio m2
            WHERE (m2.mittente_id = ? AND m2.destinatario_id = u.id)
               OR (m2.mittente_id = u.id AND m2.destinatario_id = ?)
            ORDER BY m2.data_invio DESC
            LIMIT 1
          ) AS lastMessageText
          ,
          SUM(
            CASE
              WHEN msg.destinatario_id = ? AND COALESCE(msg.letto, 0) = 0
              THEN 1
              ELSE 0
            END
          ) AS unreadCount
        FROM Utente u
        JOIN Messaggio msg
          ON (msg.mittente_id = ? AND msg.destinatario_id = u.id)
          OR (msg.mittente_id = u.id AND msg.destinatario_id = ?)
        WHERE u.id != ?
          AND u.stato = 'attivo'
          AND u.tipologia_utente IN ('studente', 'tutor')
        GROUP BY u.id
        ORDER BY lastMessageTime DESC, u.nome ASC
      `,
      [userId, userId, userId, userId, userId, userId],
    );
  },

  async getMessages(userId, otherId) {
    await this.markMessagesRead(userId, otherId);

    return all(
      `
        SELECT *
        FROM Messaggio
        WHERE (mittente_id = ? AND destinatario_id = ?)
           OR (mittente_id = ? AND destinatario_id = ?)
        ORDER BY data_invio ASC
      `,
      [userId, otherId, otherId, userId],
    );
  },

  async markMessagesRead(userId, otherId) {
    await run(
      `
        UPDATE Messaggio
        SET letto = 1
        WHERE mittente_id = ? AND destinatario_id = ?
      `,
      [otherId, userId],
    );
    return { ok: true };
  },

  async sendMessage(userId, data) {
    const result = await run(
      `
        INSERT INTO Messaggio (mittente_id, destinatario_id, contenuto)
        VALUES (?, ?, ?)
      `,
      [userId, data.destinatario_id, data.contenuto],
    );
    const newMessage = await get(`SELECT * FROM Messaggio WHERE id = ?`, [
      result.id,
    ]);
    return {
      newMessage,
      messages: await this.getMessages(userId, data.destinatario_id),
    };
  },

  async getAdminUsers() {
    return all(
      `
        SELECT id, nome, cognome, email, immagine_profilo, stato,
               tipologia_utente, data_iscrizione
        FROM Utente
        WHERE tipologia_utente IN ('studente', 'tutor')
        ORDER BY id DESC
      `,
    );
  },

  async updateUserStatus(userId, stato) {
    await run(`UPDATE Utente SET stato = ? WHERE id = ?`, [stato, userId]);
    return this.getAdminUsers();
  },

  async deleteUser(userId) {
    await run(`DELETE FROM Utente WHERE id = ?`, [userId]);
    return this.getAdminUsers();
  },
};

module.exports = Platform;
