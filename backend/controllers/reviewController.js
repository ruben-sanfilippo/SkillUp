const Review = require("../models/reviewModel");

function requireRole(req, res, roles) {
  if (!roles.includes(req.user.tipologia_utente)) {
    res.status(403).json({ message: "Permessi insufficienti" });
    return false;
  }
  return true;
}

exports.createReview = async (req, res) => {
  try {
    if (!requireRole(req, res, ["studente"])) return;
    const bookings = await Review.createReview(req.user.id, req.body);
    if (!bookings)
      return res.status(400).json({ message: "Prenotazione non valida" });
    if (bookings.invalidVote) {
      return res.status(400).json({ message: "Voto non valido" });
    }
    if (bookings.lessonNotCompleted) {
      return res.status(400).json({
        message:
          "Puoi recensire un tutor solo dopo aver effettuato almeno una lezione.",
      });
    }
    if (bookings.duplicateReview) {
      return res.status(409).json({
        message: "Hai già lasciato una recensione per questo tutor.",
      });
    }
    res.status(201).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
