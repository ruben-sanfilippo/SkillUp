const Dashboard = require("../models/dashboardModel");

const mesi = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];

exports.getTutorDashboard = async (req, res) => {
  try {
    if (req.user.tipologia_utente !== "tutor") {
      return res.status(403).json({ message: "Accesso riservato ai tutor" });
    }

    const tutorId = req.user.id;
    const anno = Number(req.query.anno) || new Date().getFullYear();

    const [ricaviRows, materiaPiuPrenotata, materialiRows, lezioniRows] =
      await Promise.all([
        Dashboard.getRicaviMensili(tutorId, anno),
        Dashboard.getMateriaPiuPrenotata(tutorId),
        Dashboard.getStatisticheMateriali(tutorId),
        Dashboard.getProssimeLezioni(tutorId),
      ]);

    const ricaviPerMese = new Map(
      ricaviRows.map((row) => [Number(row.mese), Number(row.ricavi) || 0]),
    );

    const ricaviMensili = mesi.map((mese, index) => ({
      mese,
      ricavi: ricaviPerMese.get(index + 1) || 0,
    }));

    const materiali = materialiRows.map((materiale) => ({
      id: materiale.id,
      titolo: materiale.titolo,
      materia: materiale.materia,
      acquisti: Number(materiale.acquisti) || 0,
      ricavi: Number(materiale.ricavi) || 0,
    }));

    const prossimeLezioni = lezioniRows.map((lezione) => ({
      id: lezione.id,
      studente_id: lezione.studente_id,
      studenteNome: lezione.studenteNome,
      studenteEmail: lezione.studenteEmail,
      studenteAvatar:
        lezione.studenteAvatar ||
        `https://i.pravatar.cc/150?u=${lezione.studenteEmail}`,
      materia: lezione.materia,
      data: lezione.data,
      ora_inizio: lezione.ora_inizio,
      ora_fine: lezione.ora_fine,
      importo: Number(lezione.importo) || 0,
    }));

    res.json({
      anno,
      ricaviMensili,
      materiaPiuPrenotata: materiaPiuPrenotata
        ? {
            nome: materiaPiuPrenotata.nome,
            prenotazioni: Number(materiaPiuPrenotata.prenotazioni) || 0,
          }
        : null,
      materialePiuAcquistato: materiali[0] || null,
      materiali,
      prossimeLezioni,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
