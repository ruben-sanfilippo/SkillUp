const db = require("../db/db");

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function minuti(orario) {
  if (!/^\d{2}:\d{2}$/.test(orario || "")) return null;
  const [ore, minuti] = orario.split(":").map(Number);
  if (ore < 0 || ore > 23 || minuti < 0 || minuti > 59) return null;
  return ore * 60 + minuti;
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
    image: row.immagine_profilo || "",
    disponibileDal: row.disponibileDal,
    disponibileAl: row.disponibileAl,
  };
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
      LEFT JOIN Disponibilita_Tutor dt ON dt.tutor_id = t.utente_id
      LEFT JOIN Recensione r ON r.tutor_id = t.utente_id
      WHERE u.stato = 'attivo'
      GROUP BY u.id
    `);

    return rows.map(mappaTutor).filter((tutor) => {
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

  async getTutorById(tutorId) {
    const tutors = await this.searchTutors({});
    return tutors.find((tutor) => Number(tutor.id) === Number(tutorId)) || null;
  },

  async getAvailability(tutorId) {
    return all(
      `
        SELECT MIN(dt.id) AS id, dt.data, dt.giorno_settimana, dt.ora_inizio, dt.ora_fine,
               dt.tariffa_oraria, m.id AS materia_id, m.nome AS materia
        FROM Disponibilita_Tutor dt
        JOIN Materie m ON m.id = dt.materia_id
        WHERE dt.tutor_id = ?
        GROUP BY dt.data, dt.giorno_settimana, dt.ora_inizio, dt.ora_fine,
                 dt.tariffa_oraria, m.id, m.nome
        ORDER BY dt.data ASC, dt.ora_inizio ASC
      `,
      [tutorId],
    );
  },

  async getBookedSlots(tutorId) {
    return all(
      `
        SELECT id, disponibilita_id, materia_id, data, ora_inizio, ora_fine
        FROM Prenotazioni
        WHERE tutor_id = ?
        ORDER BY data ASC, ora_inizio ASC
      `,
      [tutorId],
    );
  },

  async replaceAvailability(tutorId, disponibilita = [], tariffaOraria = 0) {
    const tutorMaterie = await all(
      `SELECT materia_id FROM Tutor_Materie WHERE tutor_id = ?`,
      [tutorId],
    );
    const materiaIds = tutorMaterie.length
      ? tutorMaterie.map((row) => row.materia_id)
      : [await idMateria("Matematica")];

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

    await run(`DELETE FROM Disponibilita_Tutor WHERE tutor_id = ?`, [tutorId]);

    for (const item of disponibilita) {
      if (!item.attivo) continue;
      const data = item.data;
      const idsDaSalvare = item.materia_id ? [item.materia_id] : materiaIds;

      for (const materiaId of idsDaSalvare) {
        await run(
          `
            INSERT INTO Disponibilita_Tutor
            (tutor_id, materia_id, data, giorno_settimana, ora_inizio, ora_fine, tariffa_oraria)
            VALUES (?, ?, ?, ?, ?, ?, ?)
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

  async getTutorMaterials(tutorId) {
    return all(
      `
        SELECT MAX(md.id) AS id, md.titolo, md.descrizione, md.file_url,
               md.anteprima_url, md.copertina_url,
               md.importo, m.nome AS materia
        FROM Materiale_Didattico md
        JOIN Materie m ON m.id = md.materia_id
        WHERE md.tutor_id = ?
        GROUP BY md.titolo, md.descrizione, md.file_url, md.anteprima_url,
                 md.copertina_url,
                 md.importo, m.nome
        ORDER BY md.id DESC
      `,
      [tutorId],
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
    const materiale = await get(`SELECT * FROM Materiale_Didattico WHERE id = ?`, [
      materialeId,
    ]);
    if (!materiale) return null;
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

  async getPurchasedMaterials(studenteId) {
    return all(
      `
        SELECT ma.id, ma.data_acquisto, ma.importo_pagato,
               md.titolo, md.file_url, md.importo,
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
      `SELECT * FROM Disponibilita_Tutor WHERE id = ?`,
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

    const materiaId = data.materia_id || disponibilitaRichiesta.materia_id;
    const disponibilita = await get(
      `
        SELECT *
        FROM Disponibilita_Tutor
        WHERE tutor_id = ?
          AND materia_id = ?
          AND data = ?
          AND ora_inizio <= ?
          AND ora_fine >= ?
        LIMIT 1
      `,
      [
        disponibilitaRichiesta.tutor_id,
        materiaId,
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
        disponibilita.materia_id,
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

    await run(
      `
        INSERT INTO Recensione (studente_id, tutor_id, voto, commento)
        VALUES (?, ?, ?, ?)
      `,
      [studenteId, booking.tutor_id, data.voto, data.commento || ""],
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
      [userId, userId, userId, userId, userId],
    );
  },

  async getMessages(userId, otherId) {
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
