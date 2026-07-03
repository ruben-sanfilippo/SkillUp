# SkillUp 🚀

**Progetto Universitario**  
 Questo software è stato sviluppato come progetto didattico per scopi accademici ed esami universitari. Non è inteso per la messa in produzione in ambienti commerciali reali, ma funge da prototipo funzionale.

SkillUp è una piattaforma full-stack progettata per connettere studenti e tutor, facilitando la prenotazione di lezioni, la gestione dei materiali didattici e la comunicazione diretta. Il progetto è composto da un'applicazione mobile/web multipiattaforma sviluppata con **Ionic e Angular** per il frontend, e da un server **Node.js con Express e SQLite** per il backend.

---

##  Tecnologie Utilizzate

### Frontend
- **Framework:** [Ionic Framework](https://ionicframework.com/) & [Angular](https://angular.io/) (v18+ con Standalone Components)
- **Stile:** Sass (SCSS) adattivo e componenti UI nativi di Ionic
- **Gestione Stato & Routing:** Angular Router con Lazy Loading e Route Guards per la sicurezza
- **Piattaforme Target:** Web App (SPA), Android e iOS (tramite Capacitor)

### Backend
- **Ambiente di Runtime:** [Node.js](https://nodejs.org/)
- **Framework Web:** [Express.js](https://expressjs.com/)
- **Database:** [SQLite](https://www.sqlite.org/) (tramite la libreria `sqlite3` / `sqlite`)
- **Autenticazione:** JSON Web Tokens (JWT) e hashing delle password con `bcrypt`
- **Documentazione API:** Swagger / OpenAPI UI
- **Comunicazione Real-time:** Socket.io (predisposto per messaggistica istantanea)

---

##  Struttura del Progetto

```text
SkillUp/
├── backend/                # Server Express, API, Database e Modelli
│   ├── controllers/        # Logica di business (auth, booking, messaggi, recensioni, tutor, ecc.)
│   ├── db/                 # Configurazione del database SQLite e script di inizializzazione (`db.js`)
│   ├── middleware/         # Autenticazione (verifica token JWT) e upload file (Multer)
│   ├── models/             # Query e interazioni dirette con le tabelle del database
│   ├── routes/             # Definizione degli endpoint API REST
│   ├── server.js           # Punto di ingresso dell'applicazione backend
│   └── swagger.yaml        # Specifica OpenAPI della documentazione API
│
└── frontend/               # Applicazione Client (Ionic / Angular)
    ├── src/
    │   ├── app/
    │   │   ├── components/ # Componenti riutilizzabili (avatar, booking-card, modali, ecc.)
    │   │   ├── guards/     # Protezione delle rotte (Auth Guard)
    │   │   ├── interfaces/ # Interfacce TypeScript (user, tutor, booking, material)
    │   │   ├── pages/      # Pagine dell'applicazione (login, register, search-tutor, dashboard, ecc.)
    │   │   └── services/   # Servizi per le chiamate HTTP al backend (userService, tutorService, ecc.)
    │   └── assets/         # Icone e immagini statiche
    ├── angular.json        # Configurazione dell'Angular CLI
    └── package.json        # Dipendenze e script del frontend
