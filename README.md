# SkillUp 

**University Project**  
This software was developed as an educational project for academic and university examination purposes. It is not intended for production in real-world commercial environments but serves as a fully functional prototype.

SkillUp is a full-stack platform designed to connect students and tutors, streamlining lesson bookings, learning material management, and direct communication. The project consists of a cross-platform mobile/web application developed with **Ionic and Angular** for the frontend, and a **Node.js server with Express and SQLite** for the backend.

---

##  Tech Stack

### Frontend
- **Frameworks:** [Ionic Framework](https://ionicframework.com/) & [Angular](https://angular.io/) (v18+ featuring Standalone Components)
- **Styling:** Adaptive Sass (SCSS) and native Ionic UI components
- **State Management & Routing:** Angular Router with Lazy Loading and dynamic Route Guards for security
- **Target Platforms:** Web App (SPA), Android, and iOS (powered by Capacitor)

### Backend
- **Runtime Environment:** [Node.js](https://nodejs.org/)
- **Web Framework:** [Express.js](https://expressjs.com/)
- **Database:** [SQLite](https://www.sqlite.org/) (utilizing the `sqlite3` / `sqlite` libraries)
- **Authentication:** JSON Web Tokens (JWT) and secure password hashing via `bcrypt`
- **API Documentation:** Swagger / OpenAPI UI
- **Real-Time Communication:** Socket.io (configured for instant messaging workflows)

---

##  Project Structure

```text
SkillUp/
├── backend/                # Express server, REST APIs, Database, and Models
│   ├── controllers/        # Core business logic (auth, booking, messages, reviews, tutors, etc.)
│   ├── db/                 # SQLite database configuration and initialization scripts (`db.js`)
│   ├── middleware/         # Authentication guards (JWT token validation) and file uploads (Multer)
│   ├── models/             # Direct database table queries and data interactions
│   ├── routes/             # REST API endpoint definitions
│   ├── server.js           # Backend application entry point
│   └── swagger.yaml        # OpenAPI specification for API documentation
│
└── frontend/               # Client Application (Ionic / Angular)
    ├── src/
    │   ├── app/
    │   │   ├── components/ # Reusable UI components (avatar, booking-card, modals, etc.)
    │   │   ├── guards/     # Route protection mechanisms (Auth Guard)
    │   │   ├── interfaces/ # TypeScript interfaces (user, tutor, booking, material)
    │   │   ├── pages/      # Application views (login, register, search-tutor, dashboard, etc.)
    │   │   └── services/   # Services handling HTTP requests to the backend (userService, tutorService, etc.)
    │   └── assets/         # Icons and static images
    ├── angular.json        # Angular CLI configuration
    └── package.json        # Frontend dependencies and automated scripts
