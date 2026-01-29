const statsService = require('../services/statsService');

exports.getStats = async (req, res) => {
  try {
    const stats = await statsService.getRoleStats();
    res.json({ stats });
  } catch (error) {
    console.error('Fehler beim Abrufen der Rollenstatistik:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
