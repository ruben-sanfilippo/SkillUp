const fs = require("fs");
const path = require("path");
const UserProfile = require("../models/userProfileModel");
const { publicPath } = require("../middleware/uploadMiddleware");

function publicUrl(req, file) {
  return `${req.protocol}://${req.get("host")}${publicPath(file)}`;
}

function profileImagePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;

  let pathname = imageUrl;
  try {
    pathname = new URL(imageUrl).pathname;
  } catch {
    pathname = imageUrl;
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

exports.getMe = async (req, res) => {
  try {
    const user = await UserProfile.getCurrentUser(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const shouldUpdateProfileImage = req.body.immagine_profilo !== undefined;
    const previous = shouldUpdateProfileImage
      ? await UserProfile.getCurrentUser(req.user.id)
      : null;
    const user = await UserProfile.updateCurrentUser(req.user.id, req.body);
    if (user.invalidPaymentMethod) {
      return res.status(400).json({
        message:
          "Inserisci un metodo di pagamento valido con titolare, numero carta, scadenza e CVV.",
      });
    }
    if (
      shouldUpdateProfileImage &&
      previous?.immagine_profilo &&
      previous.immagine_profilo !== (user.immagine_profilo || "")
    ) {
      await deleteProfileImage(previous.immagine_profilo);
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadMyAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nessuna immagine caricata." });
    }

    const previous = await UserProfile.getCurrentUser(req.user.id);
    const user = await UserProfile.updateCurrentUser(req.user.id, {
      immagine_profilo: publicUrl(req, req.file),
    });
    if (previous?.immagine_profilo !== user.immagine_profilo) {
      await deleteProfileImage(previous?.immagine_profilo);
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await UserProfile.getUserSummary(req.params.id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
