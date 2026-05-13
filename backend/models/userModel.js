const db = require("../db/db");

const User = {
  create: (nome, cognome, email, password, tipologia_utente) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO Utente (nome, cognome, email, password, tipologia_utente) VALUES (?, ?, ?, ?, ?)`;
      db.run(query, [nome, cognome, email, password, tipologia_utente], function (err) {
        if (err){
             reject(err);
        }
        else{
            resolve({id: this.lastID, nome: nome, cognome: cognome, email: email, tipologia_utente: tipologia_utente});
        }
      });
    });
  },
};

module.exports = User;