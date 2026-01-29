const prisma = require('../database');
const { createAuditLog } = require('../services/auditService'); // 🔁 Wichtig: korrekt importieren

exports.getPanels = async (req, res) => {
  try {
    const panels = await prisma.panel.findMany({ include: { roles: true } });
    res.json(panels);
  } catch (error) {
    console.error('Fehler beim Abrufen der Panels:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

exports.createPanel = async (req, res) => {
  try {
    const { name, command, roles } = req.body;

    const panel = await prisma.panel.create({
      data: {
        name,
        command,
        roles: {
          create: roles.map(role => ({
            label: role.label,
            roleId: role.roleId
          }))
        }
      },
      include: { roles: true }
    });

    await createAuditLog({
      type: 'panel',
      userId: req.user.id,
      username: `${req.user.username}#${req.user.discriminator}`,
      message: `Panel erstellt: "${name}"`
    });

    res.status(201).json(panel);
  } catch (error) {
    console.error('Fehler beim Erstellen des Panels:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

exports.updatePanel = async (req, res) => {
  try {
    const panelId = req.params.id;
    const { name, command, roles } = req.body;

    await prisma.role.deleteMany({ where: { panelId } });

    const updatedPanel = await prisma.panel.update({
      where: { id: panelId },
      data: {
        name,
        command,
        roles: {
          create: roles.map(role => ({
            label: role.label,
            roleId: role.roleId
          }))
        }
      },
      include: { roles: true }
    });

console.log('📢 AuditLog-Aufruf: ', req.user);
    await createAuditLog({
      type: 'panel',
      userId: req.user.id,
      username: `${req.user.username}#${req.user.discriminator}`,
      message: `Panel bearbeitet: "${name}"`
    });

    res.json(updatedPanel);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Panels:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
  try {
  await createAuditLog({
    type: 'panel',
    userId: req.user.id,
    username: `${req.user.username}#${req.user.discriminator}`,
    message: `Panel erstellt: "${name}"`
  });
} catch (err) {
  console.error('❌ Fehler beim Schreiben ins Audit-Log:', err);
}
};

exports.deletePanel = async (req, res) => {
  try {
    const panelId = req.params.id;

    const panel = await prisma.panel.findUnique({ where: { id: panelId } });

    await prisma.role.deleteMany({ where: { panelId } });
    await prisma.panel.delete({ where: { id: panelId } });

    if (panel) {
      await createAuditLog({
        type: 'panel',
        userId: req.user.id,
        username: `${req.user.username}#${req.user.discriminator}`,
        message: `Panel gelöscht: "${panel.name}"`
      });
    }

    res.json({ message: 'Panel gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Panels:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
