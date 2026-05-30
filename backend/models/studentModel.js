const { run } = require("../db/query");

const Student = {
  create: (utente_id) => {
    return run(`INSERT INTO Studente (utente_id) VALUES (?)`, [utente_id]);
  },
};

module.exports = Student;
