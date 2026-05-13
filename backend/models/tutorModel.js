const db = require("../db/db");

const Tutor = {
    create: (utente_id) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO Tutor (utente_id) VALUES (?)`;
            db.run(query, [utente_id], (err) => {
            if (err) reject(err);
            else resolve();
            });
        });
    }
}

module.exports = Tutor;