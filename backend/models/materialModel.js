const TutorProfile = require("./tutorProfileModel");
const UserProfile = require("./userProfileModel");
const { all, get, run } = require("../db/query");

async function idMateria(nome) {
  await run(`INSERT OR IGNORE INTO Materie (nome) VALUES (?)`, [nome]);
  const row = await get(`SELECT id FROM Materie WHERE nome = ?`, [nome]);
  return row.id;
}

const Material = {
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
    const importo = Number(data.importo) || 0;
    if (importo > 0 && !(await TutorProfile.hasTutorTransferOption(tutorId))) {
      return { missingTransferOption: true };
    }

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
        importo,
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

    if (Number(materiale.importo) > 0) {
      if (!(await UserProfile.hasStudentPaymentMethod(studenteId))) {
        return { missingPaymentMethod: true };
      }

      if (!(await TutorProfile.hasTutorTransferOption(materiale.tutor_id))) {
        return { tutorMissingTransferOption: true };
      }
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
        SELECT ma.id, ma.materiale_id, ma.data_acquisto, ma.importo_pagato,
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

  async getMaterialForDownload(userId, role, materialeId) {
    const materiale = await get(
      `
        SELECT *
        FROM Materiale_Didattico
        WHERE id = ?
      `,
      [materialeId],
    );
    if (!materiale) return null;

    if (role === "tutor" && Number(materiale.tutor_id) === Number(userId)) {
      return materiale;
    }

    if (role === "studente") {
      const acquisto = await get(
        `
          SELECT id
          FROM Materiale_Acquistato
          WHERE studente_id = ?
            AND materiale_id = ?
        `,
        [userId, materialeId],
      );

      if (acquisto) return materiale;
    }

    return { forbidden: true };
  },
};

module.exports = Material;
