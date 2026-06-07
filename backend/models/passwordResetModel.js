const { get, run } = require("../db/query");

const PasswordReset = {
  invalidateActiveForUser(userId) {
    return run(
      `
        UPDATE Password_Reset
        SET usato = 1
        WHERE user_id = ? AND usato = 0
      `,
      [userId],
    );
  },

  create(userId, email, otpHash) {
    return run(
      `
        INSERT INTO Password_Reset
          (user_id, email, otp_hash, scadenza)
        VALUES (?, ?, ?, datetime('now', '+10 minutes'))
      `,
      [userId, email, otpHash],
    );
  },

  findLatestValidOtpByEmail(email) {
    return get(
      `
        SELECT pr.*, u.stato
        FROM Password_Reset pr
        JOIN Utente u ON u.id = pr.user_id
        WHERE pr.email = ?
          AND pr.usato = 0
          AND pr.scadenza > datetime('now')
        ORDER BY pr.id DESC
        LIMIT 1
      `,
      [email],
    );
  },

  markVerified(resetId, resetTokenHash) {
    return run(
      `
        UPDATE Password_Reset
        SET verificato = 1, reset_token_hash = ?
        WHERE id = ?
      `,
      [resetTokenHash, resetId],
    );
  },

  findLatestVerifiedByEmail(email) {
    return get(
      `
        SELECT pr.*, u.stato
        FROM Password_Reset pr
        JOIN Utente u ON u.id = pr.user_id
        WHERE pr.email = ?
          AND pr.verificato = 1
          AND pr.usato = 0
          AND pr.scadenza > datetime('now')
        ORDER BY pr.id DESC
        LIMIT 1
      `,
      [email],
    );
  },

  markUsed(resetId) {
    return run(`UPDATE Password_Reset SET usato = 1 WHERE id = ?`, [resetId]);
  },
};

module.exports = PasswordReset;
