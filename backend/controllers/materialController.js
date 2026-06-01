const fs = require("fs");
const path = require("path");
const Material = require("../models/materialModel");
const { privatePath, publicPath } = require("../middleware/uploadMiddleware");

function requireRole(req, res, roles) {
  if (!roles.includes(req.user.tipologia_utente)) {
    res.status(403).json({ message: "Permessi insufficienti" });
    return false;
  }
  return true;
}

function publicUrl(req, file) {
  return `${req.protocol}://${req.get("host")}${publicPath(file)}`;
}

exports.uploadMaterial = async (req, res) => {
  try {
    if (!requireRole(req, res, ["tutor"])) return;

    const files = req.files || {};
    const fileCompleto = files.file?.[0];
    if (!fileCompleto) {
      return res.status(400).json({ message: "Carica il file completo della dispensa." });
    }

    const material = await Material.createMaterial(req.user.id, {
      titolo: req.body.titolo,
      descrizione: req.body.descrizione,
      materia: req.body.materia,
      importo: req.body.importo,
      file_url: privatePath(fileCompleto),
      anteprima_url: files.anteprima?.[0] ? publicUrl(req, files.anteprima[0]) : "",
      copertina_url: files.copertina?.[0] ? publicUrl(req, files.copertina[0]) : "",
    });

    if (material.missingTransferOption) {
      return res.status(400).json({
        message:
          "Inserisci le opzioni di trasferimento prima di pubblicare materiali a pagamento.",
      });
    }
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    if (!requireRole(req, res, ["tutor"])) return;
    const result = await Material.deleteMaterial(req.user.id, req.params.id);
    if (!result)
      return res.status(404).json({ message: "Materiale non trovato" });
    res.json({ message: "Materiale eliminato" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downloadMaterial = async (req, res) => {
  try {
    const material = await Material.getMaterialForDownload(
      req.user.id,
      req.user.tipologia_utente,
      req.params.id,
    );
    if (!material) return res.status(404).json({ message: "Materiale non trovato" });
    if (material.forbidden) {
      return res.status(403).json({ message: "Devi acquistare il materiale prima di scaricarlo." });
    }

    const absolutePath = path.resolve(__dirname, "..", material.file_url || "");
    const privateRoot = path.resolve(__dirname, "..", "uploads", "private");
    if (!absolutePath.startsWith(privateRoot) || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File non trovato" });
    }

    res.download(absolutePath, path.basename(absolutePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.purchaseMaterial = async (req, res) => {
  try {
    if (!requireRole(req, res, ["studente"])) return;
    const material = await Material.purchaseMaterial(
      req.user.id,
      req.params.id,
    );
    if (!material)
      return res.status(404).json({ message: "Materiale non trovato" });
    if (material.alreadyPurchased) {
      return res.status(409).json({ message: "Materiale già acquistato" });
    }
    if (material.missingPaymentMethod) {
      return res.status(400).json({
        message:
          "Inserisci un metodo di pagamento prima di acquistare materiali a pagamento.",
      });
    }
    if (material.tutorMissingTransferOption) {
      return res.status(400).json({
        message:
          "Il tutor deve inserire le opzioni di trasferimento prima di vendere materiali a pagamento.",
      });
    }
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPurchasedMaterials = async (req, res) => {
  try {
    if (!requireRole(req, res, ["studente"])) return;
    res.json(await Material.getPurchasedMaterials(req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
