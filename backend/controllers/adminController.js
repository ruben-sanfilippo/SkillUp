const Admin = require("../models/adminModel");

function requireRole(req, res, roles) {
  if (!roles.includes(req.user.tipologia_utente)) {
    res.status(403).json({ message: "Permessi insufficienti" });
    return false;
  }
  return true;
}

exports.getAdminUsers = async (req, res) => {
  try {
    if (!requireRole(req, res, ["amministratore"])) return;
    res.json(await Admin.getAdminUsers());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    if (!requireRole(req, res, ["amministratore"])) return;
    const users = await Admin.updateUserStatus(req.params.id, req.body.stato);
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
    res.json(await Admin.deleteUser(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
