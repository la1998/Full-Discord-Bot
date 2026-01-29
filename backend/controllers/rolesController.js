const { fetchRolesFromGuild } = require('../services/discordService');

exports.getDiscordRoles = async (req, res) => {
  try {
    const roles = await fetchRolesFromGuild();
    res.json(roles);
  } catch (error) {
    console.error('❌ Fehler beim Laden der Discord-Rollen:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Discord-Rollen' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await fetchRolesFromGuild();
    res.json({ roles });
  } catch (error) {
    console.error('❌ Fehler bei getRoles:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Rollen' });
  }
};