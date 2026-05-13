require('dotenv').config();
const SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000; // vera porta nel file env, porta 3000 per permettere che il server parta anche senza il file env

const express = require('express');
const cors = require('cors');
const db = require('./db/db');
const authRoutes = require('./routes/authRoutes');  //importa il file authRoutes
const app = express();

