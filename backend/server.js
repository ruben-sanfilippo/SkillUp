require("dotenv").config();
const SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000; // vera porta nel file env, porta 3000 per permettere che il server parta anche senza il file env

const swaggerUi = require("swagger-ui-express");

const express = require("express");
const cors = require("cors"); //serve per permettere al frontend di comunicare con il backend, in quanto di default un browwser o
// l'app ionic non possono fare richieste a un server che si trova su un indirizzo o una porta diversa
const db = require("./db/db"); //importo la connessione al database SQLite
const authRoutes = require("./routes/authRoutes"); //importa il file authRoutes
const app = express(); //istanza del server
const YAML = require("yamljs");
const swaggerDocs = YAML.load("./swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json()); // Permette al server di leggere dati in formato JSON

app.use(
  cors({
    origin: "*", // Permette richieste da qualsiasi origine
    methods: ["GET", "POST", "PUT", "DELETE"], // Metodi HTTP consentiti
    allowedHeaders: ["Content-Type", "Authorization"], // Intestazioni consentite
  }),
);

// Routes
app.use("/api/auth", authRoutes);

// Rotta di prova
app.get("/", (req, res) => {
  res.send("Il server è attivo e funzionante!");
});

app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`)); //pone il server in ascolto sulla porta PORT
