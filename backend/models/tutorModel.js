const { run } = require("../db/query");

const Tutor = {
  create: (utente_id) => {
    return run(`INSERT INTO Tutor (utente_id) VALUES (?)`, [utente_id]);
  },
};

module.exports = Tutor;
