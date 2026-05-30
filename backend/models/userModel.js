const { get, run } = require("../db/query");

const User = {
  create: async (nome, cognome, email, password, tipologia_utente) => {
    const query = `
        INSERT INTO Utente
          (nome, cognome, email, password, tipologia_utente, data_iscrizione)
        VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))
      `;

    const result = await run(query, [
      nome,
      cognome,
      email,
      password,
      tipologia_utente,
    ]);

    return {
      id: result.id,
      nome,
      cognome,
      email,
      tipologia_utente,
    };
  },

  findByEmail: (email) => {
    return get(`SELECT * FROM Utente WHERE email = ?`, [email]);
  },

  updatePassword: (userId, hashedPassword) => {
    return run(`UPDATE Utente SET password = ? WHERE id = ?`, [
      hashedPassword,
      userId,
    ]);
  },
};

module.exports = User;
