const { all, get } = require("../db/query");

const Dashboard = {
  getRicaviMensili: (tutorId, anno) => {
    const query = `
        SELECT mese, SUM(ricavi) AS ricavi
        FROM (
          SELECT strftime('%m', data) AS mese, SUM(importo) AS ricavi
          FROM Prenotazioni
          WHERE tutor_id = ? AND strftime('%Y', data) = ?
          GROUP BY mese

          UNION ALL

          SELECT strftime('%m', ma.data_acquisto) AS mese,
                 SUM(ma.importo_pagato) AS ricavi
          FROM Materiale_Acquistato ma
          JOIN Materiale_Didattico md ON md.id = ma.materiale_id
          WHERE md.tutor_id = ? AND strftime('%Y', ma.data_acquisto) = ?
          GROUP BY mese
        )
        GROUP BY mese
        ORDER BY mese
      `;

    return all(query, [tutorId, String(anno), tutorId, String(anno)]);
  },

  getMateriaPiuPrenotata: (tutorId) => {
    const query = `
        SELECT m.nome, COUNT(*) AS prenotazioni
        FROM Prenotazioni p
        JOIN Materie m ON m.id = p.materia_id
        WHERE p.tutor_id = ?
        GROUP BY m.id, m.nome
        ORDER BY prenotazioni DESC, m.nome ASC
        LIMIT 1
      `;

    return get(query, [tutorId]).then((row) => row || null);
  },

  getStatisticheMateriali: (tutorId) => {
    const query = `
        SELECT
          md.id,
          md.titolo,
          COALESCE(m.nome, 'Senza materia') AS materia,
          COUNT(ma.id) AS acquisti,
          COALESCE(SUM(ma.importo_pagato), 0) AS ricavi
        FROM Materiale_Didattico md
        LEFT JOIN Materie m ON m.id = md.materia_id
        LEFT JOIN Materiale_Acquistato ma ON ma.materiale_id = md.id
        WHERE md.tutor_id = ?
        GROUP BY md.id, md.titolo, m.nome
        ORDER BY acquisti DESC, ricavi DESC, md.titolo ASC
      `;

    return all(query, [tutorId]);
  },

  getProssimeLezioni: (tutorId) => {
    const query = `
        SELECT
          p.id,
          p.studente_id,
          p.data,
          p.ora_inizio,
          p.ora_fine,
          p.importo,
          m.nome AS materia,
          s.nome || ' ' || s.cognome AS studenteNome,
          s.email AS studenteEmail,
          s.immagine_profilo AS studenteAvatar
        FROM Prenotazioni p
        JOIN Materie m ON m.id = p.materia_id
        JOIN Utente s ON s.id = p.studente_id
        WHERE p.tutor_id = ?
          AND datetime(p.data || ' ' || p.ora_inizio) >= datetime('now', 'localtime')
        ORDER BY p.data ASC, p.ora_inizio ASC
      `;

    return all(query, [tutorId]);
  },
};

module.exports = Dashboard;
