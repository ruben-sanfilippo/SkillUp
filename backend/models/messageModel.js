const { all, get, run } = require("../db/query");

const Message = {
  async getConversations(userId) {
    return all(
      `
        SELECT
          u.id,
          u.nome,
          u.cognome,
          u.email,
          u.immagine_profilo,
          MAX(msg.data_invio) AS lastMessageTime,
          (
            SELECT contenuto
            FROM Messaggio m2
            WHERE (m2.mittente_id = ? AND m2.destinatario_id = u.id)
               OR (m2.mittente_id = u.id AND m2.destinatario_id = ?)
            ORDER BY m2.data_invio DESC
            LIMIT 1
          ) AS lastMessageText
          ,
          SUM(
            CASE
              WHEN msg.destinatario_id = ? AND COALESCE(msg.letto, 0) = 0
              THEN 1
              ELSE 0
            END
          ) AS unreadCount
        FROM Utente u
        JOIN Messaggio msg
          ON (msg.mittente_id = ? AND msg.destinatario_id = u.id)
          OR (msg.mittente_id = u.id AND msg.destinatario_id = ?)
        WHERE u.id != ?
          AND u.stato = 'attivo'
          AND u.tipologia_utente IN ('studente', 'tutor')
        GROUP BY u.id
        ORDER BY lastMessageTime DESC, u.nome ASC
      `,
      [userId, userId, userId, userId, userId, userId],
    );
  },

  async getMessages(userId, otherId) {
    await this.markMessagesRead(userId, otherId);

    return all(
      `
        SELECT *
        FROM Messaggio
        WHERE (mittente_id = ? AND destinatario_id = ?)
           OR (mittente_id = ? AND destinatario_id = ?)
        ORDER BY data_invio ASC
      `,
      [userId, otherId, otherId, userId],
    );
  },

  async markMessagesRead(userId, otherId) {
    await run(
      `
        UPDATE Messaggio
        SET letto = 1
        WHERE mittente_id = ? AND destinatario_id = ?
      `,
      [otherId, userId],
    );
    return { ok: true };
  },

  async sendMessage(userId, data) {
    const result = await run(
      `
        INSERT INTO Messaggio (mittente_id, destinatario_id, contenuto)
        VALUES (?, ?, ?)
      `,
      [userId, data.destinatario_id, data.contenuto],
    );
    const newMessage = await get(`SELECT * FROM Messaggio WHERE id = ?`, [
      result.id,
    ]);
    return {
      newMessage,
      messages: await this.getMessages(userId, data.destinatario_id),
    };
  },
};

module.exports = Message;
