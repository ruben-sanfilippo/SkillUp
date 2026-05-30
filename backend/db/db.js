const sqlite3 = require("sqlite3").verbose();

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD_HASH =
  "$2b$10$3gfF640.YS7aG7ZeXqEkMeXIx/AYSw1nOvZQlcnCla.3K9.TB2a0.";

const materieIniziali = [
  "Matematica",
  "Fisica",
  "Chimica",
  "Biologia",
  "Scienze",
  "Italiano",
  "Letteratura",
  "Storia",
  "Geografia",
  "Filosofia",
  "Latino",
  "Greco",
  "Inglese",
  "Informatica",
  "Analisi Matematica 1",
  "Analisi Matematica 2",
  "Geometria",
  "Algebra Lineare",
  "Statistica",
  "Programmazione",
  "Basi di Dati",
  "Ingegneria del Software",
  "Economia",
  "Diritto",
  "Anatomia",
  "Psicologia",
];

const lingueIniziali = [
  "Italiano",
  "Inglese",
  "Spagnolo",
  "Francese",
  "Tedesco",
  "Portoghese",
  "Cinese",
  "Giapponese",
  "Arabo",
  "Russo",
  "Coreano",
  "Hindi",
  "Olandese",
  "Polacco",
  "Turco",
];

const db = new sqlite3.Database("./db/db.sqlite", (err) => {
  if (err) {
    console.error("Errore apertura database:", err.message);
    return;
  }

  console.log("Database SQLite connesso.");
  creaTabelle();
});

function creaTabelle() {
  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");

    db.run(`
      CREATE TABLE IF NOT EXISTS Utente (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        immagine_profilo TEXT DEFAULT NULL,
        stato TEXT CHECK(stato IN ('attivo', 'bloccato')) DEFAULT 'attivo',
        tipologia_utente TEXT CHECK(tipologia_utente IN ('studente', 'tutor', 'amministratore')) NOT NULL,
        data_iscrizione TEXT NOT NULL DEFAULT (date('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Tutor (
        utente_id INTEGER PRIMARY KEY,
        bio_tutor TEXT,
        media_recensioni REAL DEFAULT 0,
        FOREIGN KEY (utente_id) REFERENCES Utente(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Studente (
        utente_id INTEGER PRIMARY KEY,
        bio_studente TEXT,
        FOREIGN KEY (utente_id) REFERENCES Utente(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Metodo_Pagamento_Studente (
        studente_id INTEGER PRIMARY KEY,
        titolare TEXT NOT NULL,
        ultime_quattro TEXT NOT NULL,
        scadenza TEXT NOT NULL,
        aggiornato_il DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (studente_id) REFERENCES Studente(utente_id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Opzione_Trasferimento_Tutor (
        tutor_id INTEGER PRIMARY KEY,
        titolare_conto TEXT NOT NULL,
        iban TEXT NOT NULL,
        aggiornato_il DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Materie (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Lingue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Tutor_Materie (
        tutor_id INTEGER NOT NULL,
        materia_id INTEGER NOT NULL,
        PRIMARY KEY (tutor_id, materia_id),
        FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE,
        FOREIGN KEY (materia_id) REFERENCES Materie(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Tutor_Lingue (
        tutor_id INTEGER NOT NULL,
        lingua_id INTEGER NOT NULL,
        PRIMARY KEY (tutor_id, lingua_id),
        FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE,
        FOREIGN KEY (lingua_id) REFERENCES Lingue(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Disponibilita_Tutor (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tutor_id INTEGER NOT NULL,
        materia_id INTEGER NOT NULL,
        data TEXT,
        giorno_settimana TEXT NOT NULL,
        ora_inizio TEXT NOT NULL,
        ora_fine TEXT NOT NULL,
        tariffa_oraria REAL NOT NULL,
        eliminato INTEGER DEFAULT 0,
        FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE,
        FOREIGN KEY (materia_id) REFERENCES Materie(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Prenotazioni (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        disponibilita_id INTEGER NOT NULL,
        studente_id INTEGER NOT NULL,
        tutor_id INTEGER NOT NULL,
        materia_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        ora_inizio TEXT NOT NULL,
        ora_fine TEXT NOT NULL,
        importo REAL NOT NULL,
        FOREIGN KEY (disponibilita_id) REFERENCES Disponibilita_Tutor(id),
        FOREIGN KEY (studente_id) REFERENCES Studente(utente_id),
        FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id),
        FOREIGN KEY (materia_id) REFERENCES Materie(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Recensione (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studente_id INTEGER NOT NULL,
        tutor_id INTEGER NOT NULL,
        voto INTEGER CHECK(voto >= 1 AND voto <= 5) NOT NULL,
        commento TEXT,
        FOREIGN KEY (studente_id) REFERENCES Studente(utente_id) ON DELETE CASCADE,
        FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_recensione_studente_tutor
      ON Recensione(studente_id, tutor_id)
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Messaggio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mittente_id INTEGER NOT NULL,
        destinatario_id INTEGER NOT NULL,
        contenuto TEXT NOT NULL,
        data_invio DATETIME DEFAULT CURRENT_TIMESTAMP,
        letto INTEGER DEFAULT 0,
        FOREIGN KEY (mittente_id) REFERENCES Utente(id),
        FOREIGN KEY (destinatario_id) REFERENCES Utente(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Password_Reset (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        reset_token_hash TEXT,
        scadenza DATETIME NOT NULL,
        verificato INTEGER DEFAULT 0,
        usato INTEGER DEFAULT 0,
        creato_il DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Utente(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Materiale_Didattico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tutor_id INTEGER NOT NULL,
        materia_id INTEGER NOT NULL,
        titolo TEXT NOT NULL,
        descrizione TEXT,
        file_url TEXT NOT NULL,
        anteprima_url TEXT,
        copertina_url TEXT,
        importo REAL NOT NULL,
        eliminato INTEGER DEFAULT 0,
        FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id),
        FOREIGN KEY (materia_id) REFERENCES Materie(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Materiale_Acquistato (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studente_id INTEGER NOT NULL,
        materiale_id INTEGER NOT NULL,
        data_acquisto DATETIME DEFAULT CURRENT_TIMESTAMP,
        importo_pagato REAL NOT NULL,
        FOREIGN KEY (studente_id) REFERENCES Studente(utente_id),
        FOREIGN KEY (materiale_id) REFERENCES Materiale_Didattico(id)
      )
    `);

    db.run(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_materiale_acquistato_studente_materiale
      ON Materiale_Acquistato(studente_id, materiale_id)
    `);

    inserisciCataloghi();
    inserisciAdmin();
  });
}

function inserisciCataloghi() {
  materieIniziali.forEach((nome) => {
    db.run("INSERT OR IGNORE INTO Materie (nome) VALUES (?)", [nome]);
  });

  lingueIniziali.forEach((nome) => {
    db.run("INSERT OR IGNORE INTO Lingue (nome) VALUES (?)", [nome]);
  });
}

function inserisciAdmin() {
  db.run(
    `
      INSERT OR IGNORE INTO Utente
      (nome, cognome, email, password, tipologia_utente, data_iscrizione)
      VALUES (?, ?, ?, ?, ?, date('now'))
    `,
    ["Admin", "SkillUp", ADMIN_EMAIL, ADMIN_PASSWORD_HASH, "amministratore"],
  );
}

module.exports = db;
