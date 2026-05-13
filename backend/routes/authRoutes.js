const express = require("express");
const router = express.Router(); // Crea un router Express per gestire le rotte di autenticazione

const authController = require("../controllers/authControllers");


router.post("/register", authController.register);
//router.post("/login", authController.login);

module.exports = router;