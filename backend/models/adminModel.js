const { all, run } = require("../db/query");

const Admin = {
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

module.exports = Admin;
