const UserProfile = require("./userProfileModel");
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

function dataLocale(data = new Date()) {
  const anno = data.getFullYear();
  const mese = String(data.getMonth() + 1).padStart(2, "0");
  const giorno = String(data.getDate()).padStart(2, "0");
  return `${anno}-${mese}-${giorno}`;
}

function slotPrenotabilePerData(data, orario) {
  const dataNorm = normalizzaData(data);
  const oggi = dataLocale();
  if (dataNorm < oggi) return false;
  if (dataNorm > oggi) return true;
  return new Date(`${dataNorm}T${orario}:00`) > new Date();
}

function normalizzaIban(valore) {
  const iban = String(valore || "").replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return null;
  return iban;
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
    image: row.immagine_profilo || "",
    disponibileDal: row.disponibileDal,
    disponibileAl: row.disponibileAl,
  };
}

function mappaOpzioneTrasferimento(row) {
  if (!row) return { presente: false };

  return {
    presente: true,
    titolare_conto: row.titolare_conto,
    iban: row.iban,
  };
}

const TutorProfile = {
  async getTutorTransferOption(tutorId) {
    const row = await get(
      `
        SELECT titolare_conto, iban
        FROM Opzione_Trasferimento_Tutor
        WHERE tutor_id = ?
      `,
      [tutorId],
    );

    return mappaOpzioneTrasferimento(row);
  },

  async hasTutorTransferOption(tutorId) {
    const row = await get(
      `SELECT 1 FROM Opzione_Trasferimento_Tutor WHERE tutor_id = ? LIMIT 1`,
      [tutorId],
    );
    return !!row;
  },

  async saveTutorTransferOption(tutorId, data) {
    data = data || {};
    const titolareConto = String(
      data.titolare_conto || data.titolareConto || "",
    )
      .trim()
      .toUpperCase();
    const iban = normalizzaIban(data.iban || "");

    if (!titolareConto || !iban) {
      return { invalidTransferOption: true };
    }

    await run(
      `
        INSERT INTO Opzione_Trasferimento_Tutor
        (tutor_id, titolare_conto, iban)
        VALUES (?, ?, ?)
        ON CONFLICT(tutor_id) DO UPDATE SET
          titolare_conto = excluded.titolare_conto,
          iban = excluded.iban
      `,
      [tutorId, titolareConto, iban],
    );

    return this.getTutorTransferOption(tutorId);
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
      if (
        filtri.excludeUserId &&
        Number(tutor.id) === Number(filtri.excludeUserId)
      ) {
        return false;
      }

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
        SELECT MIN(dt.id) AS id, dt.data, dt.ora_inizio, dt.ora_fine,
               dt.tariffa_oraria, m.id AS materia_id, m.nome AS materia
        FROM Disponibilita_Tutor dt
        JOIN Materie m ON m.id = dt.materia_id
        WHERE dt.tutor_id = ?
          AND COALESCE(dt.eliminato, 0) = 0
        GROUP BY dt.data, dt.ora_inizio, dt.ora_fine, dt.tariffa_oraria, m.id, m.nome
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

      if (
        inizioMinuti === null ||
        fineMinuti === null ||
        inizioMinuti >= fineMinuti
      ) {
        return { invalidTime: true };
      }
    }

    const tariffa = Number(tariffaOraria) || 0;
    if (tariffa > 0 && !(await this.hasTutorTransferOption(tutorId))) {
      return { missingTransferOption: true };
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
            (tutor_id, materia_id, data, ora_inizio, ora_fine, tariffa_oraria, eliminato)
            VALUES (?, ?, ?, ?, ?, ?, 0)
          `,
          [
            tutorId,
            materiaId,
            data,
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
      await UserProfile.updateCurrentUser(tutorId, data);
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

    if (data.opzione_trasferimento !== undefined) {
      const result = await this.saveTutorTransferOption(
        tutorId,
        data.opzione_trasferimento,
      );
      if (result.invalidTransferOption) return result;
    }

    return this.getTutorById(tutorId);
  },
};

module.exports = TutorProfile;
