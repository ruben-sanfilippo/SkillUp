const fs = require("fs");
const path = require("path");
const TutorProfile = require("../models/tutorProfileModel");
const Material = require("../models/materialModel");
const UserProfile = require("../models/userProfileModel");

function requireRole(req, res, roles) {
  if (!roles.includes(req.user.tipologia_utente)) {
    res.status(403).json({ message: "Permessi insufficienti" });
    return false;
  }
  return true;
}

function profileImagePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;

  let pathname = imageUrl;
  try {
    pathname = new URL(imageUrl).pathname;
  } catch {
    // imageUrl puo gia essere un percorso relativo salvato da vecchi dati locali.
  }

  if (!pathname.startsWith("/uploads/public/profiles/")) return null;

  const absolutePath = path.resolve(
    __dirname,
    "..",
    pathname.replace(/^\/+/, ""),
  );
  const profilesRoot = path.resolve(
    __dirname,
    "..",
    "uploads",
    "public",
    "profiles",
  );
  if (!absolutePath.startsWith(`${profilesRoot}${path.sep}`)) return null;

  return absolutePath;
}

async function deleteProfileImage(imageUrl) {
  const absolutePath = profileImagePath(imageUrl);
  if (!absolutePath) return;

  try {
    await fs.promises.unlink(absolutePath);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

exports.searchTutors = async (req, res) => {
  try {
    const filtri = { ...(req.body || {}) };
    if (req.user?.tipologia_utente === "tutor") {
      filtri.excludeUserId = req.user.id;
    }

    res.json(await TutorProfile.searchTutors(filtri));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTutor = async (req, res) => {
  try {
    const tutor = await TutorProfile.getTutorById(req.params.id);
    if (!tutor) return res.status(404).json({ message: "Tutor non trovato" });

    const studenteId =
      req.user.tipologia_utente === "studente" ? req.user.id : null;

    const [availability, materials, bookedSlots, availableSchedule] =
      await Promise.all([
        TutorProfile.getAvailability(req.params.id),
        Material.getTutorMaterials(req.params.id, studenteId),
        TutorProfile.getBookedSlots(req.params.id, studenteId),
        TutorProfile.getAvailableSchedule(req.params.id, studenteId),
      ]);

    res.json({
      ...tutor,
      availability,
      materials,
      bookedSlots,
      availableSchedule,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTutorMe = async (req, res) => {
  if (!requireRole(req, res, ["tutor"])) return;
  try {
    const tutor = await TutorProfile.getTutorById(req.user.id);
    if (!tutor) return res.status(404).json({ message: "Tutor non trovato" });

    const [
      availability,
      materials,
      bookedSlots,
      availableSchedule,
      transferOption,
    ] = await Promise.all([
      TutorProfile.getAvailability(req.user.id),
      Material.getTutorMaterials(req.user.id),
      TutorProfile.getBookedSlots(req.user.id),
      TutorProfile.getAvailableSchedule(req.user.id),
      TutorProfile.getTutorTransferOption(req.user.id),
    ]);

    res.json({
      ...tutor,
      availability,
      materials,
      bookedSlots,
      availableSchedule,
      opzione_trasferimento: transferOption,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTutorMe = async (req, res) => {
  try {
    if (!requireRole(req, res, ["tutor"])) return;
    const shouldUpdateProfileImage = req.body.immagine_profilo !== undefined;
    const previous = shouldUpdateProfileImage
      ? await UserProfile.getCurrentUser(req.user.id)
      : null;
    const tutor = await TutorProfile.updateTutorProfile(req.user.id, req.body);
    if (tutor.invalidTransferOption) {
      return res.status(400).json({
        message: "Inserisci un titolare del conto e un IBAN validi.",
      });
    }
    if (
      shouldUpdateProfileImage &&
      previous?.immagine_profilo &&
      previous.immagine_profilo !== (req.body.immagine_profilo || "")
    ) {
      await deleteProfileImage(previous.immagine_profilo);
    }
    const transferOption = await TutorProfile.getTutorTransferOption(
      req.user.id,
    );
    res.json({ ...tutor, opzione_trasferimento: transferOption });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAvailabilityMe = async (req, res) => {
  try {
    if (!requireRole(req, res, ["tutor"])) return;
    const availability = await TutorProfile.replaceAvailability(
      req.user.id,
      req.body.disponibilita || [],
      req.body.tariffa_oraria,
    );
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
    if (availability.missingTransferOption) {
      return res.status(400).json({
        message:
          "Inserisci le opzioni di trasferimento prima di impostare lezioni a pagamento.",
      });
    }
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
