require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const db = require("../db/db");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    //Decodifica il token ritornando il body codificato con JWT_SECRET
    //Se il token non è valido lancia un errore
    const verified = jwt.verify(token, JWT_SECRET);

    db.get(
      `SELECT id, stato, tipologia_utente FROM Utente WHERE id = ?`,
      [verified.id],
      (err, user) => {
        if (err) {
          return res.status(500).json({ message: "Errore autenticazione" });
        }
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
        }; //Inserisce dentro req id e tipologia utente, in questo modo il controller può usare questi dati
        next(); //Passa alla funzione sucessiva
      },
    );
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
