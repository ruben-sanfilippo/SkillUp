require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("Token received:", token);
    console.log("SECRET used for verification:", JWT_SECRET);
    //Decodifica il token ritornando il body codificato con JWT_SECRET
    //Se il token non è valido lancia un errore
    const verified = jwt.verify(token, JWT_SECRET);

    req.user = verified; //Inserisce dentro req id e tipologia utente, in questo modo il controller può usare questi dati
    next(); //Passa alla funzione sucessiva
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};
