const sqlite3 = require("sqlite3").verbose();

// Connessione al database
const db = new sqlite3.Database("db.sqlite", (err) => {
  if (err) {
    console.error("Errore nell'apertura del database:", err.message);
  } else {
    console.log("Connesso al database SQLite. Il file è pronto.");
    //richiamo la funzione creaTabelle in modo che
    // la creazione avvenga soltanto dopo che il server
    // ha stabilito la connessione col database
    creaTabelle();
  }
});

function creaTabelle() {
  db.serialize(() => {
    // Abilita il supporto alle chiavi esterne
    db.run(`PRAGMA foreign_keys = ON;`);

    // Tabella Utente
    db.run(
      `
            CREATE TABLE IF NOT EXISTS Utente (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                immagine_profilo TEXT,
                stato TEXT CHECK(stato IN ('attivo', 'bloccato')) DEFAULT 'attivo',
                tipologia_utente TEXT CHECK(tipologia_utente IN ('studente', 'tutor', 'amministratore')) NOT NULL
            )
        `,
      (err) => {
        if (err) console.error("Errore Utente:", err.message);
        else console.log("Tabella Utente OK");
      },
    );

    // Tabella Tutor
    db.run(
      `
            CREATE TABLE IF NOT EXISTS Tutor (
                utente_id INTEGER PRIMARY KEY,
                bio_tutor TEXT,
                media_recensioni REAL DEFAULT 0,
                FOREIGN KEY (utente_id) REFERENCES Utente(id) ON DELETE CASCADE
            )
        `,
      (err) => {
        if (err) console.error("Errore Tutor:", err.message);
        else console.log("Tabella Tutor OK");
      },
    );

    // Tabella Studente
    db.run(
      `
            CREATE TABLE IF NOT EXISTS Studente (
                utente_id INTEGER PRIMARY KEY,
                bio_studente TEXT,
                FOREIGN KEY (utente_id) REFERENCES Utente(id) ON DELETE CASCADE
            )
        `,
      (err) => {
        if (err) console.error("Errore Studente:", err.message);
        else console.log("Tabella Studente OK");
      },
    );

    // Tabella Materie
    db.run(
      `
            CREATE TABLE IF NOT EXISTS Materie (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL UNIQUE
            )
        `,
      (err) => {
        if (err) console.error("Errore Materie:", err.message);
        else console.log("Tabella Materie OK");
      },
    );

    //Tabella Disponibilita_Tutor
    db.run(
      `
            CREATE TABLE IF NOT EXISTS Disponibilita_Tutor (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tutor_id INTEGER NOT NULL,
                materia_id INTEGER NOT NULL,
                giorno_settimana TEXT NOT NULL,
                ora_inizio TEXT NOT NULL,
                ora_fine TEXT NOT NULL,
                tariffa_oraria REAL NOT NULL,
                FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE,
                FOREIGN KEY (materia_id) REFERENCES Materie(id) ON DELETE CASCADE
            )
        `,
      (err) => {
        if (err) console.error("Errore Disponibilita:", err.message);
        else console.log("Tabella Disponibilità OK");
      },
    );

    //Tabella Prenotazioni
    db.run(
      `
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
        `,
      (err) => {
        if (err) console.error("Errore Prenotazioni:", err.message);
        else console.log("Tabella Prenotazioni OK");
      },
    );

    //Tabella Recensione
    db.run(
      `
            CREATE TABLE IF NOT EXISTS Recensione (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                studente_id INTEGER NOT NULL,
                tutor_id INTEGER NOT NULL,
                voto INTEGER CHECK(voto >= 1 AND voto <= 5) NOT NULL,
                commento TEXT,
                FOREIGN KEY (studente_id) REFERENCES Studente(utente_id) ON DELETE CASCADE,
                FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE
            )
        `,
      (err) => {
        if (err) console.error("Errore Recensione:", err.message);
        else console.log("Tabella Recensione OK");
      },
    );

    // Tabella Messaggio
    db.run(
      `
            CREATE TABLE IF NOT EXISTS Messaggio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mittente_id INTEGER NOT NULL,
                destinatario_id INTEGER NOT NULL,
                contenuto TEXT NOT NULL,
                data_invio DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (mittente_id) REFERENCES Utente(id),
                FOREIGN KEY (destinatario_id) REFERENCES Utente(id)
            )
        `,
      (err) => {
        if (err) console.error("Errore Messaggio:", err.message);
        else console.log("Tabella Messaggio OK");
      },
    );

    //Tabella Materiale_Didattico
    db.run(
      `
            CREATE TABLE IF NOT EXISTS Materiale_Didattico (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tutor_id INTEGER NOT NULL,
                materia_id INTEGER NOT NULL,
                titolo TEXT NOT NULL,
                descrizione TEXT,
                file_url TEXT NOT NULL,
                importo REAL NOT NULL,
                FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE,
                FOREIGN KEY (materia_id) REFERENCES Materie(id) ON DELETE CASCADE
            )
        `,
      (err) => {
        if (err) console.error("Errore Materiale Didattico:", err.message);
        else console.log("Tabella Materiale Didattico OK");
      },
    );

    //Tabella Materiale_Acquistato
    db.run(
      `
            CREATE TABLE IF NOT EXISTS Materiale_Acquistato (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                studente_id INTEGER NOT NULL,
                materiale_id INTEGER NOT NULL,
                data_acquisto DATETIME DEFAULT CURRENT_TIMESTAMP,
                importo_pagato REAL NOT NULL,
                FOREIGN KEY (studente_id) REFERENCES Studente(utente_id),
                FOREIGN KEY (materiale_id) REFERENCES Materiale_Didattico(id)
            )
        `,
      (err) => {
        if (err) console.error("Errore Materiale Acquistato:", err.message);
        else console.log("Tabella Materiale Acquistato OK");
      },
    );
  });

  //Chiusura sicura
  db.close((err) => {
    if (err) {
      console.error("Errore nella chiusura:", err.message);
    } else {
      console.log("Configurazione iniziale completata. Connessione chiusa.");
    }
  });
}
