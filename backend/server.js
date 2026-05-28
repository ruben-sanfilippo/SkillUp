require("dotenv").config();
const PORT = process.env.PORT || 3000; // vera porta nel file env, porta 3000 per permettere che il server parta anche senza il file env

const swaggerUi = require("swagger-ui-express");

const express = require("express");
const http = require("http");
const cors = require("cors"); //serve per permettere al frontend di comunicare con il backend, in quanto di default un browwser o
// l'app ionic non possono fare richieste a un server che si trova su un indirizzo o una porta diversa
const { Server } = require("socket.io");
const db = require("./db/db"); //importo la connessione al database SQLite
const authRoutes = require("./routes/authRoutes"); //importa il file authRoutes
const dashboardRoutes = require("./routes/dashboardRoutes");
const platformRoutes = require("./routes/platformRoutes");
const app = express(); //istanza del server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const YAML = require("yamljs");
const swaggerDocs = YAML.load("./swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.set("io", io);

app.use(express.json({ limit: "250mb" })); // Permette al server di leggere dati in formato JSON
app.use(express.urlencoded({ limit: "250mb", extended: true }));

app.use(
  cors({
    origin: "*", // Permette richieste da qualsiasi origine
    methods: ["GET", "POST", "PUT", "DELETE"], // Metodi HTTP consentiti
    allowedHeaders: ["Content-Type", "Authorization"], // Intestazioni consentite
  }),
);

io.on("connection", (socket) => {
  socket.on("join-user", (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", platformRoutes);

// Rotta di prova
app.get("/", (req, res) => {
  res.send("Il server è attivo e funzionante!");
});

server.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`)); //pone il server in ascolto sulla porta PORT
