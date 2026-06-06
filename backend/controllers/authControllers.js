require("dotenv").config();
const bcrypt = require("bcrypt"); // per criptare le informazioni
const jwt = require("jsonwebtoken"); // per creare token di autenticazione, che permettono di mantenere la sessione dell'utente dopo il login
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { get, run } = require("../db/query");
const User = require("../models/userModel");
const Tutor = require("../models/tutorModel");
const Student = require("../models/studentModel");
const JWT_SECRET = process.env.JWT_SECRET;

function capitalizzaNome(value) {
  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("it-IT")
    .replace(/(^|[\s'-])([a-zàèéìòù])/g, (_, separatore, iniziale) => {
      return separatore + iniziale.toLocaleUpperCase("it-IT");
    });
}

function generaOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function generaResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function inviaEmailOtp(email, otp) {
  const emailUser = process.env.SMTP_USER;
  const emailPass = process.env.SMTP_PASS;
  const emailHost = process.env.SMTP_HOST;
  const emailPort = Number(process.env.SMTP_PORT || 587);

  if (!emailUser || !emailPass || !emailHost) {
    console.log(`[RECUPERO PASSWORD] OTP per ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || emailUser,
    to: email,
    subject: "Codice OTP recupero password SkillUp",
    text: `Il tuo codice OTP per modificare la password è: ${otp}. Il codice scade tra 10 minuti.`,
  });
}

exports.register = async (req, res) => {
  try {
    const { nome, cognome, email, password, tipologia_utente } = req.body;

    if (!nome || !cognome || !email || !password || !tipologia_utente) {
      return res.status(400).json({ message: "Compila tutti i campi richiesti." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nomeFormattato = capitalizzaNome(nome);
    const cognomeFormattato = capitalizzaNome(cognome);

    const newUser = await User.create(
      nomeFormattato,
      cognomeFormattato,
      email,
      hashedPassword,
      tipologia_utente,
    );

    if (tipologia_utente === "tutor") {
      await Tutor.create(newUser.id);
    } else if (tipologia_utente === "studente") {
      await Student.create(newUser.id);
    }

    res.status(201).json({ message: "Registrazione completata!" });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      //errore restituito da SQLite quando si tenta di inserire un'email già esistente
      return res
        .status(400)
        .json({ message: "Questa email è già registrata nel sistema." });
    }

    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findByEmail(email);
    if (!existingUser) {
      return res.status(400).json({ message: "E-mail o password non corrette." });
    }

    if (existingUser.stato === "bloccato") {
      return res.status(403).json({
        message:
          "Account bloccato. Contatta l'amministratore per maggiori informazioni.",
      });
    }

    //Verifica che la password criptata sia corrispondente
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenziali non valide." });
    }

    //Creazione del token JWT
    const token = jwt.sign(
      {
        id: existingUser.id,
        tipologia_utente: existingUser.tipologia_utente,
      },
      JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    res
      .status(200)
      .json({ token: token, tipologia_utente: existingUser.tipologia_utente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.requestPasswordOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Inserisci la tua e-mail." });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "E-mail non trovata." });
    }
    if (user.stato === "bloccato") {
      return res.status(403).json({
        message:
          "Account bloccato. Contatta l'amministratore per maggiori informazioni.",
      });
    }

    const otp = generaOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await run(
      `
        UPDATE Password_Reset
        SET usato = 1
        WHERE user_id = ? AND usato = 0
      `,
      [user.id],
    );
    await run(
      `
        INSERT INTO Password_Reset
          (user_id, email, otp_hash, scadenza)
        VALUES (?, ?, ?, datetime('now', '+10 minutes'))
      `,
      [user.id, email, otpHash],
    );

    await inviaEmailOtp(email, otp);
    res.json({ message: "Codice OTP inviato alla tua e-mail." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPasswordOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();
    if (!email || !otp) {
      return res.status(400).json({ message: "E-mail e codice OTP richiesti." });
    }

    const reset = await get(
      `
        SELECT pr.*, u.stato
        FROM Password_Reset pr
        JOIN Utente u ON u.id = pr.user_id
        WHERE pr.email = ?
          AND pr.usato = 0
          AND pr.scadenza > datetime('now')
        ORDER BY pr.id DESC
        LIMIT 1
      `,
      [email],
    );

    if (!reset) {
      return res.status(400).json({ message: "Codice OTP scaduto o non valido." });
    }
    if (reset.stato === "bloccato") {
      return res.status(403).json({
        message:
          "Account bloccato. Contatta l'amministratore per maggiori informazioni.",
      });
    }

    const otpValido = await bcrypt.compare(otp, reset.otp_hash);
    if (!otpValido) {
      return res.status(400).json({ message: "Codice OTP non valido." });
    }

    const resetToken = generaResetToken();
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    await run(
      `
        UPDATE Password_Reset
        SET verificato = 1, reset_token_hash = ?
        WHERE id = ?
      `,
      [resetTokenHash, reset.id],
    );

    res.json({
      message: "Codice OTP verificato.",
      resetToken,
      email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const resetToken = String(req.body.resetToken || "").trim();
    const nuovaPassword = String(req.body.nuovaPassword || "");

    if (!email || !resetToken || !nuovaPassword) {
      return res.status(400).json({ message: "Dati mancanti." });
    }
    if (
      nuovaPassword.length < 8 ||
      !/[A-Z]/.test(nuovaPassword) ||
      !/[0-9]/.test(nuovaPassword)
    ) {
      return res.status(400).json({
        message:
          "La password deve contenere almeno 8 caratteri, una lettera maiuscola e un numero.",
      });
    }

    const reset = await get(
      `
        SELECT pr.*, u.stato
        FROM Password_Reset pr
        JOIN Utente u ON u.id = pr.user_id
        WHERE pr.email = ?
          AND pr.verificato = 1
          AND pr.usato = 0
          AND pr.scadenza > datetime('now')
        ORDER BY pr.id DESC
        LIMIT 1
      `,
      [email],
    );

    if (!reset || !reset.reset_token_hash) {
      return res.status(400).json({ message: "Richiesta non valida o scaduta." });
    }
    if (reset.stato === "bloccato") {
      return res.status(403).json({
        message:
          "Account bloccato. Contatta l'amministratore per maggiori informazioni.",
      });
    }

    const tokenValido = await bcrypt.compare(resetToken, reset.reset_token_hash);
    if (!tokenValido) {
      return res.status(400).json({ message: "Richiesta non valida o scaduta." });
    }

    const hashedPassword = await bcrypt.hash(nuovaPassword, 10);
    await User.updatePassword(reset.user_id, hashedPassword);
    await run(`UPDATE Password_Reset SET usato = 1 WHERE id = ?`, [reset.id]);

    res.json({ message: "Password modificata con successo." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
