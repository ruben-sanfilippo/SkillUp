const sqlite3 = require("sqlite3").verbose();

// Connessione al database
const db = new sqlite3.Database("./db/db.sqlite", (err) => {
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
                cognome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                immagine_profilo TEXT DEFAULT NULL,
                stato TEXT CHECK(stato IN ('attivo', 'bloccato')) DEFAULT 'attivo',
                tipologia_utente TEXT CHECK(tipologia_utente IN ('studente', 'tutor', 'amministratore')) NOT NULL,
                data_iscrizione TEXT DEFAULT NULL
            )
        `,
      (err) => {
        if (err) console.error("Errore Utente:", err.message);
        else console.log("Tabella Utente OK");
      },
    );

    db.run(`ALTER TABLE Utente ADD COLUMN data_iscrizione TEXT`, () => {});
    db.run(
      `UPDATE Utente SET data_iscrizione = datetime('now','localtime') WHERE data_iscrizione IS NULL`,
      () => {},
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
                data TEXT,
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

    db.run(`ALTER TABLE Disponibilita_Tutor ADD COLUMN data TEXT`, () => {});

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

    db.run(`ALTER TABLE Messaggio ADD COLUMN letto INTEGER DEFAULT 0`, () => {});

    db.run(
      `
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
        `,
      (err) => {
        if (err) console.error("Errore Password_Reset:", err.message);
        else console.log("Tabella Password_Reset OK");
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
                anteprima_url TEXT,
                copertina_url TEXT,
                importo REAL NOT NULL,
                eliminato INTEGER DEFAULT 0,
                FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id),
                FOREIGN KEY (materia_id) REFERENCES Materie(id)
            )
        `,
      (err) => {
        if (err) console.error("Errore Materiale Didattico:", err.message);
        else console.log("Tabella Materiale Didattico OK");
      },
    );

    db.run(`ALTER TABLE Materiale_Didattico ADD COLUMN anteprima_url TEXT`, () => {});
    db.run(`ALTER TABLE Materiale_Didattico ADD COLUMN copertina_url TEXT`, () => {});
    db.run(`ALTER TABLE Materiale_Didattico ADD COLUMN eliminato INTEGER DEFAULT 0`, () => {});

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

    db.run(
      `
            CREATE TABLE IF NOT EXISTS Lingue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL UNIQUE
            )
        `,
      (err) => {
        if (err) console.error("Errore Lingue:", err.message);
        else console.log("Tabella Lingue OK");
      },
    );

    db.run(
      `
            CREATE TABLE IF NOT EXISTS Tutor_Materie (
                tutor_id INTEGER NOT NULL,
                materia_id INTEGER NOT NULL,
                PRIMARY KEY (tutor_id, materia_id),
                FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE,
                FOREIGN KEY (materia_id) REFERENCES Materie(id) ON DELETE CASCADE
            )
        `,
      (err) => {
        if (err) console.error("Errore Tutor_Materie:", err.message);
        else console.log("Tabella Tutor_Materie OK");
      },
    );

    db.run(
      `
            CREATE TABLE IF NOT EXISTS Tutor_Lingue (
                tutor_id INTEGER NOT NULL,
                lingua_id INTEGER NOT NULL,
                PRIMARY KEY (tutor_id, lingua_id),
                FOREIGN KEY (tutor_id) REFERENCES Tutor(utente_id) ON DELETE CASCADE,
                FOREIGN KEY (lingua_id) REFERENCES Lingue(id) ON DELETE CASCADE
            )
        `,
      (err) => {
        if (err) console.error("Errore Tutor_Lingue:", err.message);
        else console.log("Tabella Tutor_Lingue OK");
      },
    );

    popolaDatiIniziali();
  });
}

function popolaDatiIniziali() {
  const passwordDemo =
    "$2b$10$jjM6q.NjqlVOo.VKovEh8uPMIjJMFg85lqVd1mpqied6vjVn9ok/S";
  const materie = [
    "Matematica",
    "Fisica",
    "Letteratura",
    "Informatica",
    "Inglese",
    "Scienze",
    "Analisi Matematica 1",
    "Chimica",
    "Geometria",
  ];
  const lingue = ["Italiano", "Inglese", "Spagnolo", "Francese", "Tedesco"];
  const utentiDemo = [
    {
      nome: "Mario",
      cognome: "Admin",
      email: "admin@skillup.local",
      tipologia: "amministratore",
    },
    {
      nome: "Elena",
      cognome: "Rostova",
      email: "elena.rostova@skillup.local",
      tipologia: "tutor",
      bio: "Dottorato in Matematica, specializzata in preparazione esami universitari.",
      materie: ["Matematica", "Fisica"],
      lingue: ["Italiano", "Inglese"],
      tariffa: 45,
    },
    {
      nome: "Marco",
      cognome: "Chen",
      email: "marco.chen@skillup.local",
      tipologia: "tutor",
      bio: "Ingegnere informatico con esperienza in programmazione e fisica applicata.",
      materie: ["Fisica", "Informatica"],
      lingue: ["Italiano", "Francese"],
      tariffa: 60,
    },
    {
      nome: "Sara",
      cognome: "Jenkins",
      email: "sara.jenkins@skillup.local",
      tipologia: "tutor",
      bio: "Tutor di inglese e letteratura, appassionata di scrittura accademica.",
      materie: ["Letteratura", "Inglese"],
      lingue: ["Inglese", "Spagnolo"],
      tariffa: 35,
    },
    {
      nome: "Alessandro",
      cognome: "Rossi",
      email: "studente@skillup.local",
      tipologia: "studente",
      bio: "Studente universitario interessato a informatica e matematica.",
    },
  ];

  materie.forEach((nome) => {
    db.run(`INSERT OR IGNORE INTO Materie (nome) VALUES (?)`, [nome]);
  });

  lingue.forEach((nome) => {
    db.run(`INSERT OR IGNORE INTO Lingue (nome) VALUES (?)`, [nome]);
  });

  utentiDemo.forEach((utente) => {
    db.run(
      `
        INSERT OR IGNORE INTO Utente
        (nome, cognome, email, password, tipologia_utente, data_iscrizione)
        VALUES (?, ?, ?, ?, ?, date('now'))
      `,
      [
        utente.nome,
        utente.cognome,
        utente.email,
        passwordDemo,
        utente.tipologia,
      ],
    );

    db.get(`SELECT id FROM Utente WHERE email = ?`, [utente.email], (err, row) => {
      if (err || !row) return;

      if (utente.tipologia === "tutor") {
        db.run(`INSERT OR IGNORE INTO Tutor (utente_id, bio_tutor) VALUES (?, ?)`, [
          row.id,
          utente.bio,
        ]);
        associaTutor(row.id, utente.materie || [], utente.lingue || [], utente.tariffa);
      } else if (utente.tipologia === "studente") {
        db.run(
          `INSERT OR IGNORE INTO Studente (utente_id, bio_studente) VALUES (?, ?)`,
          [row.id, utente.bio || ""],
        );
      }
    });
  });

  setTimeout(inserisciPrenotazioniDemoMaggio, 1000);
}

function inserisciPrenotazioniDemoMaggio() {
  const slotDemo = [
    { data: "2026-05-29", giorno: "venerdi", orari: ["09:30", "11:00", "14:30", "16:00"] },
    { data: "2026-05-30", giorno: "sabato", orari: ["10:00", "12:00", "15:00", "17:00"] },
    { data: "2026-05-31", giorno: "domenica", orari: ["09:00", "11:00", "15:30", "17:30"] },
  ];

  db.get(
    `SELECT id FROM Utente WHERE email = 'studente@skillup.local'`,
    (errStudente, studente) => {
      if (errStudente || !studente) return;

      db.all(
        `
          SELECT
            t.utente_id AS tutor_id,
            COALESCE(MIN(tm.materia_id), (SELECT id FROM Materie WHERE nome = 'Matematica')) AS materia_id,
            COALESCE(MIN(dt.tariffa_oraria), 35) AS tariffa
          FROM Tutor t
          LEFT JOIN Tutor_Materie tm ON tm.tutor_id = t.utente_id
          LEFT JOIN Disponibilita_Tutor dt ON dt.tutor_id = t.utente_id
          GROUP BY t.utente_id
        `,
        (errTutor, tutorRows) => {
          if (errTutor || !tutorRows) return;

          tutorRows.forEach((tutor, tutorIndex) => {
            slotDemo.forEach((slot) => {
              const inizioPrenotazione =
                slot.orari[tutorIndex % slot.orari.length];
              const finePrenotazione = aggiungiOre(inizioPrenotazione, 1);
              const disponibilitaInizio = aggiungiOre(inizioPrenotazione, -0.5);
              const disponibilitaFine = aggiungiOre(finePrenotazione, 0.5);

              db.run(
                `
                  INSERT INTO Disponibilita_Tutor
                  (tutor_id, materia_id, data, giorno_settimana, ora_inizio, ora_fine, tariffa_oraria)
                  SELECT ?, ?, ?, ?, ?, ?, ?
                  WHERE NOT EXISTS (
                    SELECT 1 FROM Disponibilita_Tutor
                    WHERE tutor_id = ?
                      AND materia_id = ?
                      AND data = ?
                      AND ora_inizio = ?
                      AND ora_fine = ?
                  )
                `,
                [
                  tutor.tutor_id,
                  tutor.materia_id,
                  slot.data,
                  slot.giorno,
                  disponibilitaInizio,
                  disponibilitaFine,
                  tutor.tariffa,
                  tutor.tutor_id,
                  tutor.materia_id,
                  slot.data,
                  disponibilitaInizio,
                  disponibilitaFine,
                ],
                () => {
                  db.get(
                    `
                      SELECT id
                      FROM Disponibilita_Tutor
                      WHERE tutor_id = ?
                        AND materia_id = ?
                        AND data = ?
                        AND ora_inizio = ?
                        AND ora_fine = ?
                      LIMIT 1
                    `,
                    [
                      tutor.tutor_id,
                      tutor.materia_id,
                      slot.data,
                      disponibilitaInizio,
                      disponibilitaFine,
                    ],
                    (errDisponibilita, disponibilita) => {
                      if (errDisponibilita || !disponibilita) return;

                      db.run(
                        `
                          INSERT INTO Prenotazioni
                          (disponibilita_id, studente_id, tutor_id, materia_id, data, ora_inizio, ora_fine, importo)
                          SELECT ?, ?, ?, ?, ?, ?, ?, ?
                          WHERE NOT EXISTS (
                            SELECT 1 FROM Prenotazioni
                            WHERE studente_id = ?
                              AND tutor_id = ?
                              AND materia_id = ?
                              AND data = ?
                              AND ora_inizio = ?
                          )
                        `,
                        [
                          disponibilita.id,
                          studente.id,
                          tutor.tutor_id,
                          tutor.materia_id,
                          slot.data,
                          inizioPrenotazione,
                          finePrenotazione,
                          tutor.tariffa,
                          studente.id,
                          tutor.tutor_id,
                          tutor.materia_id,
                          slot.data,
                          inizioPrenotazione,
                        ],
                      );
                    },
                  );
                },
              );
            });
          });
        },
      );
    },
  );
}

function aggiungiOre(orario, oreDaAggiungere) {
  const [ore, minuti] = orario.split(":").map(Number);
  const totaleMinuti = ore * 60 + minuti + Math.round(oreDaAggiungere * 60);
  const oreFinali = Math.floor(totaleMinuti / 60).toString().padStart(2, "0");
  const minutiFinali = (totaleMinuti % 60).toString().padStart(2, "0");
  return `${oreFinali}:${minutiFinali}`;
}

function associaTutor(tutorId, materie, lingue, tariffa) {
  materie.forEach((materia) => {
    db.get(`SELECT id FROM Materie WHERE nome = ?`, [materia], (err, row) => {
      if (err || !row) return;

      db.run(
        `INSERT OR IGNORE INTO Tutor_Materie (tutor_id, materia_id) VALUES (?, ?)`,
        [tutorId, row.id],
      );
      db.run(
        `
          INSERT INTO Disponibilita_Tutor
          (tutor_id, materia_id, data, giorno_settimana, ora_inizio, ora_fine, tariffa_oraria)
          SELECT ?, ?, date('now'), 'oggi', '09:00', '18:00', ?
          WHERE NOT EXISTS (
            SELECT 1 FROM Disponibilita_Tutor
            WHERE tutor_id = ? AND materia_id = ? AND data = date('now')
          )
        `,
        [tutorId, row.id, tariffa, tutorId, row.id],
        () => {
          db.run(
            `
              INSERT INTO Prenotazioni
              (disponibilita_id, studente_id, tutor_id, materia_id, data, ora_inizio, ora_fine, importo)
              SELECT dt.id, s.id, ?, ?, dt.data, '09:00', '10:00', ?
              FROM Disponibilita_Tutor dt
              JOIN Utente s ON s.email = 'studente@skillup.local'
              WHERE dt.tutor_id = ?
                AND dt.materia_id = ?
                AND dt.data = date('now')
                AND NOT EXISTS (
                  SELECT 1 FROM Prenotazioni p
                  WHERE p.data = dt.data
                    AND p.ora_inizio = '09:00'
                    AND (p.studente_id = s.id OR p.tutor_id = ?)
                )
              LIMIT 1
            `,
            [tutorId, row.id, tariffa, tutorId, row.id, tutorId],
          );
        },
      );
      db.run(
        `
          INSERT INTO Materiale_Didattico
          (tutor_id, materia_id, titolo, descrizione, file_url, anteprima_url, importo)
          SELECT ?, ?, ?, ?, ?, ?, ?
          WHERE NOT EXISTS (
            SELECT 1 FROM Materiale_Didattico
            WHERE tutor_id = ? AND materia_id = ? AND titolo = ?
          )
        `,
        [
          tutorId,
          row.id,
          `Dispensa di ${materia}`,
          `Materiale introduttivo per ${materia}.`,
          `dispensa-${materia.toLowerCase().replace(/\s+/g, "-")}.pdf`,
          "",
          5,
          tutorId,
          row.id,
          `Dispensa di ${materia}`,
        ],
        () => {
          db.run(
            `
              INSERT INTO Materiale_Acquistato
              (studente_id, materiale_id, importo_pagato)
              SELECT s.id, md.id, md.importo
              FROM Materiale_Didattico md
              JOIN Utente s ON s.email = 'studente@skillup.local'
              WHERE md.tutor_id = ?
                AND md.materia_id = ?
                AND md.titolo = ?
                AND NOT EXISTS (
                  SELECT 1 FROM Materiale_Acquistato ma
                  WHERE ma.studente_id = s.id
                    AND ma.materiale_id = md.id
                )
              LIMIT 1
            `,
            [tutorId, row.id, `Dispensa di ${materia}`],
          );
        },
      );
    });
  });

  lingue.forEach((lingua) => {
    db.get(`SELECT id FROM Lingue WHERE nome = ?`, [lingua], (err, row) => {
      if (err || !row) return;
      db.run(
        `INSERT OR IGNORE INTO Tutor_Lingue (tutor_id, lingua_id) VALUES (?, ?)`,
        [tutorId, row.id],
      );
    });
  });
}

module.exports = db; //mi permette di usare il db in altri file.
