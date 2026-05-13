const bcrypt = require("bcrypt"); // per criptare le informazioni
const jwt = require("jsonwebtoken"); // per creare token di autenticazione, che permettono di mantenere la sessione dell'utente dopo il login
const User = require("../models/userModel");
const Tutor = require("../models/tutorModel");
const Studente = require("../models/studenteModel");

exports.register = async (req, res) => {
    try {
        const { nome, cognome, email, password, tipologia_utente } = req.body;

        if (!nome || !cognome || !email || !password || !tipologia_utente) {
            return res.status(400).json({ message: "All fields are required" });
        }

        console.log("Registrazione utente:");
        console.log("Nome:", nome);
        console.log("Cognome:", cognome);
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("Tipo di utente:", tipologia_utente);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create(nome, cognome, email, hashedPassword, tipologia_utente);

        if (tipologia_utente === 'tutor') {
            await Tutor.create(newUser.id); 
        } else if (tipologia_utente === 'studente') {
            await Studente.create(newUser.id);
        }

        res.status(201).json({ message: "Registrazione completata!", user: newUser });

    } catch (err) {

        if (err.message.includes("UNIQUE constraint failed")) { //errore restituito da SQLite quando si tenta di inserire un'email già esistente
            return res.status(400).json({ message: "Questa email è già registrata nel sistema." });
        } 

        res.status(500).json({ error: err.message });
    }
};