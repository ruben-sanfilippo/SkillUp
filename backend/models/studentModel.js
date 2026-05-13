const db = require("../db/db");

const Student = {
  create: (utente_id) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO Studente (utente_id) VALUES (?)`;
      db.run(query, [utente_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
};

module.exports = Studente;
