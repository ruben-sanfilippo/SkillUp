const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.join(__dirname, "..", "uploads");
const publicRoot = path.join(uploadRoot, "public");
const privateRoot = path.join(uploadRoot, "private");

const publicProfiles = path.join(publicRoot, "profiles");
const publicMaterials = path.join(publicRoot, "materials");
const privateMaterials = path.join(privateRoot, "materials");

for (const dir of [publicProfiles, publicMaterials, privateMaterials]) {
  fs.mkdirSync(dir, { recursive: true });
}

function nomeSicuro(originalName = "file") {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base || "file"}${ext}`;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "immagine_profilo") {
      cb(null, publicProfiles);
      return;
    }

    if (file.fieldname === "file") {
      cb(null, privateMaterials);
      return;
    }

    cb(null, publicMaterials);
  },
  filename(req, file, cb) {
    cb(null, nomeSicuro(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024,
  },
});

function publicPath(file) {
  const relative = path.relative(publicRoot, file.path).replace(/\\/g, "/");
  return `/uploads/public/${relative}`;
}

function privatePath(file) {
  return path.relative(path.join(__dirname, ".."), file.path).replace(/\\/g, "/");
}

module.exports = {
  upload,
  publicPath,
  privatePath,
  privateMaterials,
};
