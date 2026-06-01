const { get, run } = require("../db/query");

function soloCifre(valore) {
  return String(valore || "").replace(/\D/g, "");
}

function normalizzaScadenzaCarta(valore) {
  const parti = String(valore || "").trim().match(/^(\d{2})\/(\d{2}|\d{4})$/);
  if (!parti) return null;

  const mese = Number(parti[1]);
  if (mese < 1 || mese > 12) return null;

  const anno = parti[2].length === 2 ? Number(`20${parti[2]}`) : Number(parti[2]);
  if (!Number.isInteger(anno)) return null;

  const ultimoGiornoMese = new Date(anno, mese, 0, 23, 59, 59);
  if (ultimoGiornoMese < new Date()) return null;

  return `${String(mese).padStart(2, "0")}/${String(anno).slice(-2)}`;
}

function mappaMetodoPagamento(row) {
  if (!row) return { presente: false };

  return {
    presente: true,
    titolare: row.titolare,
    scadenza: row.scadenza,
    ultime_quattro: row.ultime_quattro,
    carta_mascherata: `**** **** **** ${row.ultime_quattro}`,
  };
}

const UserProfile = {
  async getStudentPaymentMethod(studenteId) {
    const row = await get(
      `
        SELECT titolare, ultime_quattro, scadenza
        FROM Metodo_Pagamento_Studente
        WHERE studente_id = ?
      `,
      [studenteId],
    );

    return mappaMetodoPagamento(row);
  },

  async hasStudentPaymentMethod(studenteId) {
    const row = await get(
      `SELECT 1 FROM Metodo_Pagamento_Studente WHERE studente_id = ? LIMIT 1`,
      [studenteId],
    );
    return !!row;
  },

  async saveStudentPaymentMethod(studenteId, data) {
    data = data || {};
    const numeroCarta = soloCifre(
      data.numero_carta || data.numeroCarta || data.numero || "",
    );
    const cvv = soloCifre(data.cvv || "");
    const scadenza = normalizzaScadenzaCarta(
      data.scadenza || data.data_scadenza || "",
    );
    const titolare = String(data.titolare || data.titolare_carta || "")
      .trim()
      .toUpperCase();

    if (
      !titolare ||
      numeroCarta.length < 13 ||
      numeroCarta.length > 19 ||
      !scadenza ||
      cvv.length < 3 ||
      cvv.length > 4
    ) {
      return { invalidPaymentMethod: true };
    }

    await run(
      `
        INSERT INTO Metodo_Pagamento_Studente
        (studente_id, titolare, ultime_quattro, scadenza)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(studente_id) DO UPDATE SET
          titolare = excluded.titolare,
          ultime_quattro = excluded.ultime_quattro,
          scadenza = excluded.scadenza
      `,
      [studenteId, titolare, numeroCarta.slice(-4), scadenza],
    );

    return this.getStudentPaymentMethod(studenteId);
  },

  async getCurrentUser(userId) {
    const user = await get(
      `
        SELECT id, nome, cognome, email, immagine_profilo, stato,
               tipologia_utente, data_iscrizione
        FROM Utente
        WHERE id = ?
      `,
      [userId],
    );

    if (!user) return null;

    if (user.tipologia_utente === "studente") {
      const studente = await get(
        `SELECT bio_studente FROM Studente WHERE utente_id = ?`,
        [userId],
      );
      user.bio = studente?.bio_studente || "";
      user.metodo_pagamento = await this.getStudentPaymentMethod(userId);
    }

    if (user.tipologia_utente === "tutor") {
      const tutor = await get(`SELECT bio_tutor FROM Tutor WHERE utente_id = ?`, [
        userId,
      ]);
      user.bio = tutor?.bio_tutor || "";
    }

    return user;
  },

  async getUserSummary(userId) {
    return get(
      `
        SELECT id, nome, cognome, email, immagine_profilo, tipologia_utente
        FROM Utente
        WHERE id = ? AND stato = 'attivo'
      `,
      [userId],
    );
  },

  async updateCurrentUser(userId, data) {
    if (data.nome || data.cognome || data.immagine_profilo !== undefined) {
      const current = await this.getCurrentUser(userId);
      await run(
        `
          UPDATE Utente
          SET nome = ?, cognome = ?, immagine_profilo = ?
          WHERE id = ?
        `,
        [
          data.nome || current.nome,
          data.cognome || current.cognome,
          data.immagine_profilo !== undefined
            ? data.immagine_profilo
            : current.immagine_profilo,
          userId,
        ],
      );
    }

    if (data.bio !== undefined) {
      const user = await this.getCurrentUser(userId);
      if (user.tipologia_utente === "studente") {
        await run(`UPDATE Studente SET bio_studente = ? WHERE utente_id = ?`, [
          data.bio,
          userId,
        ]);
      } else if (user.tipologia_utente === "tutor") {
        await run(`UPDATE Tutor SET bio_tutor = ? WHERE utente_id = ?`, [
          data.bio,
          userId,
        ]);
      }
    }

    if (data.metodo_pagamento !== undefined) {
      const user = await this.getCurrentUser(userId);
      if (user.tipologia_utente !== "studente") {
        return { invalidPaymentMethod: true };
      }

      const result = await this.saveStudentPaymentMethod(
        userId,
        data.metodo_pagamento,
      );
      if (result.invalidPaymentMethod) return result;
    }

    return this.getCurrentUser(userId);
  },
};

module.exports = UserProfile;
