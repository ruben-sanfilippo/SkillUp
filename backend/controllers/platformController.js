const Platform = require("../models/platformModel");

function requireRole(req, res, roles) {
  if (!roles.includes(req.user.tipologia_utente)) {
    res.status(403).json({ message: "Permessi insufficienti" });
    return false;
  }
  return true;
}

exports.getMe = async (req, res) => {
  try {
    const user = await Platform.getCurrentUser(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const user = await Platform.updateCurrentUser(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchTutors = async (req, res) => {
  try {
    res.json(await Platform.searchTutors(req.body || {}));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTutor = async (req, res) => {
  try {
    const tutor = await Platform.getTutorById(req.params.id);
    if (!tutor) return res.status(404).json({ message: "Tutor non trovato" });

    const studenteId =
      req.user.tipologia_utente === "studente" ? req.user.id : null;

    const [availability, materials, bookedSlots, availableSchedule] = await Promise.all([
      Platform.getAvailability(req.params.id),
      Platform.getTutorMaterials(req.params.id, studenteId),
      Platform.getBookedSlots(req.params.id, studenteId),
      Platform.getAvailableSchedule(req.params.id, studenteId),
    ]);

    res.json({ ...tutor, availability, materials, bookedSlots, availableSchedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTutorMe = async (req, res) => {
  if (!requireRole(req, res, ["tutor"])) return;
  req.params.id = req.user.id;
  return exports.getTutor(req, res);
};

exports.updateTutorMe = async (req, res) => {
  try {
    if (!requireRole(req, res, ["tutor"])) return;
    res.json(await Platform.updateTutorProfile(req.user.id, req.body));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAvailabilityMe = async (req, res) => {
  try {
    if (!requireRole(req, res, ["tutor"])) return;
    const availability = await Platform.replaceAvailability(
      req.user.id,
      req.body.disponibilita || [],
      req.body.tariffa_oraria,
    );
    if (availability.invalidPastDate) {
      return res.status(400).json({
        message: "Non puoi aggiungere disponibilita per giorni gia passati.",
      });
    }
    if (availability.invalidTime) {
      return res.status(400).json({
        message: "Gli orari di disponibilita non sono validi.",
      });
    }
    if (availability.noSubjects) {
      return res.status(400).json({
        message:
          "Seleziona almeno una materia prima di inserire disponibilita.",
      });
    }
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await Platform.getUserSummary(req.params.id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    if (!requireRole(req, res, ["tutor"])) return;
    res.status(201).json(await Platform.createMaterial(req.user.id, req.body));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    if (!requireRole(req, res, ["tutor"])) return;
    const result = await Platform.deleteMaterial(req.user.id, req.params.id);
    if (!result)
      return res.status(404).json({ message: "Materiale non trovato" });
    res.json({ message: "Materiale eliminato" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.purchaseMaterial = async (req, res) => {
  try {
    if (!requireRole(req, res, ["studente"])) return;
    const material = await Platform.purchaseMaterial(
      req.user.id,
      req.params.id,
    );
    if (!material)
      return res.status(404).json({ message: "Materiale non trovato" });
    if (material.alreadyPurchased) {
      return res.status(409).json({ message: "Materiale già acquistato" });
    }
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPurchasedMaterials = async (req, res) => {
  try {
    if (!requireRole(req, res, ["studente"])) return;
    res.json(await Platform.getPurchasedMaterials(req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    if (!requireRole(req, res, ["studente"])) return;
    const booking = await Platform.createBooking(req.user.id, req.body);
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
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    res.json(
      await Platform.getBookingsForUser(req.user.id, req.user.tipologia_utente),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    if (!requireRole(req, res, ["studente"])) return;
    const bookings = await Platform.createReview(req.user.id, req.body);
    if (!bookings)
      return res.status(400).json({ message: "Prenotazione non valida" });
    res.status(201).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Platform.getConversations(req.user.id);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    res.json(await Platform.getMessages(req.user.id, req.params.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markMessagesRead = async (req, res) => {
  try {
    res.json(await Platform.markMessagesRead(req.user.id, req.params.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const result = await Platform.sendMessage(req.user.id, req.body);
    const io = req.app.get("io");
    if (io && result.newMessage) {
      io.to(`user:${result.newMessage.destinatario_id}`).emit(
        "message-received",
        result.newMessage,
      );
      io.to(`user:${result.newMessage.mittente_id}`).emit(
        "message-received",
        result.newMessage,
      );
    }
    res.status(201).json(result.messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    if (!requireRole(req, res, ["amministratore"])) return;
    res.json(await Platform.getAdminUsers());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    if (!requireRole(req, res, ["amministratore"])) return;
    const users = await Platform.updateUserStatus(req.params.id, req.body.stato);
    const io = req.app.get("io");
    if (io && req.body.stato === "bloccato") {
      io.to(`user:${req.params.id}`).emit("user-status-updated", {
        stato: "bloccato",
      });
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!requireRole(req, res, ["amministratore"])) return;
    res.json(await Platform.deleteUser(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
