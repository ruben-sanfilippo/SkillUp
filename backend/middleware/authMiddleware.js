require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const { get } = require("../db/query");

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    const user = await get(
      `SELECT id, stato, tipologia_utente FROM Utente WHERE id = ?`,
      [verified.id],
    );

    if (!user) {
      return res.status(401).json({ message: "Utente non trovato" });
    }
    if (user.stato === "bloccato") {
      return res.status(403).json({
        message: "Il tuo account e stato bloccato. Verrai disconnesso.",
      });
    }

    req.user = {
      ...verified,
      tipologia_utente: user.tipologia_utente,
    };
    next();
  } catch (err) {
    const status = err.name === "JsonWebTokenError" ? 401 : 500;
    const message = status === 401 ? "Invalid token" : "Errore autenticazione";
    res.status(status).json({ message });
  }
};
