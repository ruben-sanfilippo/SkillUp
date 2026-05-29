const db = require("../db/db");

const User = {
  create: (nome, cognome, email, password, tipologia_utente) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO Utente
          (nome, cognome, email, password, tipologia_utente, data_iscrizione)
        VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))
      `;
      db.run(
        query,
        [nome, cognome, email, password, tipologia_utente],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              nome: nome,
              cognome: cognome,
              email: email,
              tipologia_utente: tipologia_utente,
            });
          }
        },
      );
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Utente WHERE email = ?`;
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  updatePassword: (userId, hashedPassword) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Utente SET password = ? WHERE id = ?`;
      db.run(query, [hashedPassword, userId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  },
};

module.exports = User;
