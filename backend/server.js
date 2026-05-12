const express = require('express');
const cors = require('cors');
const db = require('./db/db');

const authRoutes = require('./routes/authRoutes');  //importa il file authRoutes
const app = express();

