require("dotenv").config();
const PORT = process.env.PORT || 3000; // vera porta nel file env, porta 3000 per permettere che il server parta anche senza il file env
const path = require("path");

const swaggerUi = require("swagger-ui-express");

const express = require("express");
const http = require("http");
const cors = require("cors"); //serve per permettere al frontend di comunicare con il backend, in quanto di default un browwser o
// l'app ionic non possono fare richieste a un server che si trova su un indirizzo o una porta diversa
const { Server } = require("socket.io");
const db = require("./db/db"); //importo la connessione al database SQLite
const authRoutes = require("./routes/authRoutes"); //importa il file authRoutes
const adminUserRoutes = require("./routes/adminUserRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const materialRoutes = require("./routes/materialRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express(); //istanza del server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});
const YAML = require("yamljs");
const swaggerDocs = YAML.load("./swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.set("io", io);

app.use(express.json({ limit: "250mb" })); // Permette al server di leggere dati in formato JSON
app.use(express.urlencoded({ limit: "250mb", extended: true }));
app.use("/uploads/public", express.static(path.join(__dirname, "uploads", "public")));

app.use(
  cors({
    origin: "*", // Permette richieste da qualsiasi origine
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Metodi HTTP consentiti
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
app.use("/api/users", userRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminUserRoutes);

// Rotta di prova
app.get("/", (req, res) => {
  res.send("Il server è attivo e funzionante!");
});

server.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`)); //pone il server in ascolto sulla porta PORT
