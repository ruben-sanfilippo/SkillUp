const TutorProfile = require("./tutorProfileModel");
const UserProfile = require("./userProfileModel");
const { all, get, run } = require("../db/query");

function minuti(orario) {
  const parti = String(orario || "").split(":").slice(0, 2).map(Number);
  if (parti.length < 2 || parti.some((parte) => Number.isNaN(parte))) {
    return null;
  }
  const [ore, min] = parti;
  if (ore < 0 || ore > 23 || min < 0 || min > 59) return null;
  return ore * 60 + min;
}

const Booking = {
  async createBooking(studenteId, data) {
    const disponibilitaRichiesta = await get(
      `
        SELECT *
        FROM Disponibilita_Tutor
        WHERE id = ?
          AND COALESCE(eliminato, 0) = 0
      `,
      [data.disponibilita_id],
    );
    if (!disponibilitaRichiesta) return null;

    const inizioMinuti = minuti(data.ora_inizio);
    const fineMinuti = minuti(data.ora_fine);
    if (inizioMinuti === null || fineMinuti === null || inizioMinuti >= fineMinuti) {
      return { invalidSlot: true };
    }

    const inizioPrenotazione = new Date(`${data.data}T${data.ora_inizio}:00`);
    if (inizioPrenotazione <= new Date()) {
      return { invalidTime: true };
    }

    const materiaId = Number(data.materia_id || disponibilitaRichiesta.materia_id);
    const materiaTutor = await get(
      `
        SELECT 1
        FROM Tutor_Materie
        WHERE tutor_id = ? AND materia_id = ?
      `,
      [disponibilitaRichiesta.tutor_id, materiaId],
    );

    if (!materiaTutor) return { invalidSubject: true };

    const disponibilita = await get(
      `
        SELECT *
        FROM Disponibilita_Tutor
        WHERE tutor_id = ?
          AND data = ?
          AND ora_inizio <= ?
          AND ora_fine >= ?
          AND COALESCE(eliminato, 0) = 0
        LIMIT 1
      `,
      [
        disponibilitaRichiesta.tutor_id,
        data.data,
        data.ora_inizio,
        data.ora_fine,
      ],
    );

    if (!disponibilita) return { invalidSlot: true };

    const conflitto = await get(
      `
        SELECT id
        FROM Prenotazioni
        WHERE data = ?
          AND (studente_id = ? OR tutor_id = ?)
          AND ora_inizio < ?
          AND ora_fine > ?
        LIMIT 1
      `,
      [
        data.data,
        studenteId,
        disponibilita.tutor_id,
        data.ora_fine,
        data.ora_inizio,
      ],
    );

    if (conflitto) {
      return { conflict: true };
    }

    const ore =
      (Number(data.ora_fine.split(":")[0]) * 60 +
        Number(data.ora_fine.split(":")[1]) -
        (Number(data.ora_inizio.split(":")[0]) * 60 +
          Number(data.ora_inizio.split(":")[1]))) /
      60;
    const importo = Math.max(0, ore * disponibilita.tariffa_oraria);
    if (importo > 0) {
      if (!(await UserProfile.hasStudentPaymentMethod(studenteId))) {
        return { missingPaymentMethod: true };
      }

      if (!(await TutorProfile.hasTutorTransferOption(disponibilita.tutor_id))) {
        return { tutorMissingTransferOption: true };
      }
    }

    const result = await run(
      `
        INSERT INTO Prenotazioni
        (disponibilita_id, studente_id, tutor_id, materia_id, data, ora_inizio, ora_fine, importo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        disponibilita.id,
        studenteId,
        disponibilita.tutor_id,
        materiaId,
        data.data,
        data.ora_inizio,
        data.ora_fine,
        importo,
      ],
    );

    return get(`SELECT * FROM Prenotazioni WHERE id = ?`, [result.id]);
  },

  async getBookingsForUser(userId, ruolo) {
    const field = ruolo === "tutor" ? "p.tutor_id" : "p.studente_id";
    return all(
      `
        SELECT p.*, m.nome AS materia,
               tutor.nome || ' ' || tutor.cognome AS tutorName,
               tutor.immagine_profilo AS tutorAvatar,
               stud.nome || ' ' || stud.cognome AS studentName,
               EXISTS(
                 SELECT 1 FROM Recensione r
                 WHERE r.studente_id = p.studente_id AND r.tutor_id = p.tutor_id
               ) AS hasReviewed
        FROM Prenotazioni p
        JOIN Materie m ON m.id = p.materia_id
        JOIN Utente tutor ON tutor.id = p.tutor_id
        JOIN Utente stud ON stud.id = p.studente_id
        WHERE ${field} = ?
        ORDER BY
          CASE
            WHEN datetime(p.data || ' ' || p.ora_inizio) >= datetime('now', 'localtime')
            THEN 0
            ELSE 1
          END,
          CASE
            WHEN datetime(p.data || ' ' || p.ora_inizio) >= datetime('now', 'localtime')
            THEN datetime(p.data || ' ' || p.ora_inizio)
          END ASC,
          CASE
            WHEN datetime(p.data || ' ' || p.ora_inizio) < datetime('now', 'localtime')
            THEN datetime(p.data || ' ' || p.ora_inizio)
          END DESC
      `,
      [userId],
    );
  },
};

module.exports = Booking;
