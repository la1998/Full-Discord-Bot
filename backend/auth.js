require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { PrismaClient } = require('@prisma/client');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const router = express.Router();
const prisma = new PrismaClient();
const scopes = ['identify', 'guilds', 'guilds.members.read'];

const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});
discordClient.login(process.env.DISCORD_TOKEN);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_REDIRECT_URI,
      scope: scopes,
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(() => done(null, profile));
    }
  )
);

// === Session Middleware ===
function setupSession(app) {
  app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  proxy: true, // <<< wichtig hinter Cloudflare/Caddy

  cookie: {
    secure: process.env.COOKIE_SECURE === 'true', // <<< eindeutig
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}));
  app.use(passport.initialize());
  app.use(passport.session());
}

// === Auth-Routen ===
router.get('/login', passport.authenticate('discord'));

router.get('/callback', passport.authenticate('discord', {
  failureRedirect: (process.env.FRONTEND_URL || '/'),
  successRedirect: (process.env.FRONTEND_URL || '/'),
}));

router.get('/success', (req, res) => {
  res.send('<h2>✅ Erfolgreich eingeloggt!</h2><script>setTimeout(() => window.close(), 1000)</script>');
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// === Auth Info (mit Rollenprüfung) ===
router.get('/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Nicht eingeloggt' });

  try {
    const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(req.user.id);

    const isDiscordAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isBotmaster = req.user.id === process.env.BOTMASTER_ID;

    let isAdmin = false;
    const adminUser = await prisma.adminUser.findUnique({ where: { discordId: req.user.id } });
    if (adminUser) isAdmin = true;

    if (!isDiscordAdmin) {
      return res.status(403).json({ error: 'Zugriff verweigert – Kein Discord-Administrator' });
    }

    res.json({
      user: req.user,
      isDiscordAdmin,
      isBotmaster,
      isAdmin
    });
  } catch (err) {
    console.error('Fehler beim Abrufen von /me:', err);
    return res.status(500).json({ error: 'Fehler bei Benutzerprüfung' });
  }
});

// === Zugriffsmiddleware (angepasst) ===
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }

  // Falls bereits angereichert, weiter
  if (req.user.username && req.user.discriminator) return next();

  // Dynamisch aus Discord nachladen (z. B. bei Panels)
  discordClient.guilds.fetch(process.env.GUILD_ID)
    .then(guild => guild.members.fetch(req.user.id))
    .then(member => {
      req.user.username = member.user.username;
      req.user.discriminator = member.user.discriminator;
      next();
    })
    .catch(err => {
      console.error('Discord-Daten konnten nicht geladen werden:', err);
      res.status(500).json({ error: 'Discord-Fehler bei Authentifizierung' });
    });
}

async function requireAdmin(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Nicht eingeloggt' });

  const userId = req.user.id;
  if (userId === process.env.BOTMASTER_ID) return next();

  const admin = await prisma.adminUser.findUnique({ where: { discordId: userId } });
  if (admin) return next();

  return res.status(403).json({ error: 'Kein Adminzugang' });
}

module.exports = {
  authRouter: router,
  setupSession,
  requireAuth,
  requireAdmin
};
