require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { Client, GatewayIntentBits } = require('discord.js');

const prisma = new PrismaClient();
const botClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const DISCORD_GUILD_ID = process.env.GUILD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const BOTMASTER_ID = process.env.BOTMASTER_ID;

const rolesController = require('./controllers/rolesController');
const statsController = require('./controllers/statsController');
const panelController = require('./controllers/panelController');
const discordService = require('./services/discordService');
const { authRouter, setupSession, requireAuth, requireAdmin } = require('./auth');
//const auditlogController = require('./controllers/auditlogController');

const app = express();

// Behind reverse proxies / Cloudflare Tunnel, this is important for secure cookies
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// If you serve the frontend from the same domain, the browser won't need CORS.
// This is still useful for local dev or if you host frontend separately.
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser clients
    const allowed = [FRONTEND_URL];
    return allowed.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
setupSession(app);

app.use('/api/auth', authRouter);

// Admin Settings
app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await prisma.adminSetting.findMany();
    res.json(settings);
  } catch (err) {
    console.error('Fehler beim Laden der AdminSettings:', err);
    res.status(500).json({ error: 'Fehler beim Laden der AdminSettings' });
  }
});

app.put('/api/admin/settings/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const updated = await prisma.adminSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    res.json(updated);
  } catch (err) {
    console.error('Fehler beim Aktualisieren der AdminSettings:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

// AdminUser API
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const admins = await prisma.adminUser.findMany({
      select: { discordId: true, username: true },
      orderBy: { addedAt: 'asc' }
    });
    res.json(admins);
  } catch (err) {
    console.error('Fehler beim Laden der AdminUser:', err);
    res.status(500).json({ error: 'Fehler beim Laden der AdminUser' });
  }
});

app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { discordId, username } = req.body;
    if (!discordId || !username) return res.status(400).json({ error: 'Ungültige Daten' });

    await prisma.adminUser.create({ data: { discordId, username } });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Fehler beim Hinzufügen eines AdminUser:', err);
    res.status(500).json({ error: 'Fehler beim Hinzufügen' });
  }
});

app.delete('/api/admin/users/:discordId', requireAdmin, async (req, res) => {
  try {
    const { discordId } = req.params;

    if (discordId === BOTMASTER_ID) {
      return res.status(403).json({ error: 'Du kannst den BOTMASTER nicht entfernen.' });
    }

    await prisma.adminUser.delete({ where: { discordId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Fehler beim Entfernen eines AdminUser:', err);
    res.status(500).json({ error: 'Fehler beim Entfernen' });
  }
});

// Benutzerrolle ändern
app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin', 'botmaster'].includes(role)) {
    return res.status(400).json({ error: 'Ungültige Rolle' });
  }

  const userToUpdate = await prisma.user.findUnique({ where: { id } });
  if (!userToUpdate) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

  if (userToUpdate.discordId === BOTMASTER_ID) {
    return res.status(403).json({ error: 'Botmaster-Rolle darf nicht verändert werden' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { role }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Rolle' });
  }
});

app.get('/api/auditlog', requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await prisma.auditLogEntry.findMany({ // ✅ KORREKT
      where: {
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    console.error('Fehler beim Laden der Audit-Logs:', error);
    res.status(500).json({ error: 'AuditLog-Fehler' });
  }
});


app.get('/api/roles', rolesController.getRoles);
app.get('/api/panels', panelController.getPanels);
app.post('/api/panels', requireAuth, panelController.createPanel);
app.put('/api/panels/:id', requireAuth, panelController.updatePanel);
app.delete('/api/panels/:id', requireAuth, panelController.deletePanel);

// === Neue Statistikroute mit Discord-Sync ===
app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const guild = await botClient.guilds.fetch(DISCORD_GUILD_ID);
    const members = await guild.members.fetch();
    const rolesInDb = await prisma.role.findMany();

    for (const role of rolesInDb) {
      const liveCount = members.filter(m => m.roles.cache.has(role.roleId)).size;
      await prisma.role.updateMany({
        where: { roleId: role.roleId },
        data: { count: liveCount }
      });
    }

    const updatedRoles = await prisma.role.findMany({
      select: { roleId: true, label: true, count: true },
      orderBy: { count: 'desc' }
    });

    res.json(updatedRoles);
  } catch (error) {
    console.error('Fehler bei /api/stats:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Statistik' });
  }
});

app.get('/api/discord-roles', async (req, res) => {
  try {
    const roles = await discordService.fetchRolesFromGuild();
    res.json({ roles });
  } catch (error) {
    console.error('Fehler beim Abrufen der Discord-Rollen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Rollen' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend läuft auf http://localhost:${PORT}`);
  botClient.login(DISCORD_TOKEN);
});
