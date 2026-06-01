const Booking = require("../models/bookingModel");

function requireRole(req, res, roles) {
  if (!roles.includes(req.user.tipologia_utente)) {
    res.status(403).json({ message: "Permessi insufficienti" });
    return false;
  }
  return true;
}

exports.createBooking = async (req, res) => {
  try {
    if (!requireRole(req, res, ["studente"])) return;
    const booking = await Booking.createBooking(req.user.id, req.body);
    if (!booking) {
      return res.status(400).json({
        message:
          "La disponibilita scelta non e piu disponibile. Seleziona un altro orario.",
      });
    }
    if (booking.invalidTime) {
      return res.status(400).json({
        message:
          "Non puoi prenotare una lezione di oggi con un orario precedente all'ora attuale.",
      });
    }
    if (booking.invalidSlot) {
      return res.status(400).json({
        message:
          "La fascia oraria scelta non e piu disponibile. Seleziona un altro orario.",
      });
    }
    if (booking.invalidSubject) {
      return res.status(400).json({
        message: "La materia scelta non e tra quelle insegnate dal tutor.",
      });
    }
    if (booking.conflict) {
      return res.status(409).json({
        message:
          "Esiste già una prenotazione per questo giorno e questa fascia oraria.",
      });
    }
    if (booking.missingPaymentMethod) {
      return res.status(400).json({
        message:
          "Inserisci un metodo di pagamento prima di prenotare lezioni a pagamento.",
      });
    }
    if (booking.tutorMissingTransferOption) {
      return res.status(400).json({
        message:
          "Il tutor deve inserire le opzioni di trasferimento prima di svolgere lezioni a pagamento.",
      });
    }
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    res.json(
      await Booking.getBookingsForUser(req.user.id, req.user.tipologia_utente),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
