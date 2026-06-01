const Booking = require("./bookingModel");
const { get, run } = require("../db/query");

const Review = {
  async createReview(studenteId, data) {
    const booking = await get(`SELECT * FROM Prenotazioni WHERE id = ?`, [
      data.prenotazione_id,
    ]);
    if (!booking || Number(booking.studente_id) !== Number(studenteId)) {
      return null;
    }

    const voto = Number(data.voto);
    if (!Number.isInteger(voto) || voto < 1 || voto > 5) {
      return { invalidVote: true };
    }

    const lezioneConclusa = await get(
      `
        SELECT 1
        WHERE datetime(? || ' ' || ?) <= datetime('now', 'localtime')
      `,
      [booking.data, booking.ora_fine],
    );

    if (!lezioneConclusa) {
      return { lessonNotCompleted: true };
    }

    const recensioneEsistente = await get(
      `
        SELECT id
        FROM Recensione
        WHERE studente_id = ?
          AND tutor_id = ?
        LIMIT 1
      `,
      [studenteId, booking.tutor_id],
    );

    if (recensioneEsistente) {
      return { duplicateReview: true };
    }

    await run(
      `
        INSERT INTO Recensione (studente_id, tutor_id, voto)
        VALUES (?, ?, ?)
      `,
      [studenteId, booking.tutor_id, voto],
    );

    await run(
      `
        UPDATE Tutor
        SET media_recensioni = (
          SELECT AVG(voto) FROM Recensione WHERE tutor_id = ?
        )
        WHERE utente_id = ?
      `,
      [booking.tutor_id, booking.tutor_id],
    );

    return Booking.getBookingsForUser(studenteId, "studente");
  },
};

module.exports = Review;
