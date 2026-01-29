const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAuditLog({ type, userId, username, message }) {
  // Maximal 20 Logeinträge speichern
  const logs = await prisma.auditLogEntry.findMany({
    orderBy: { timestamp: 'desc' },
    skip: 19,
    take: 100
  });

  if (logs.length > 0) {
    const oldest = await prisma.auditLogEntry.findFirst({
      orderBy: { timestamp: 'asc' }
    });
    if (oldest) {
      await prisma.auditLogEntry.delete({ where: { id: oldest.id } });
    }
  }

  return prisma.auditLogEntry.create({
    data: {
      type,
      userId,
      username,
      message
    }
  });
}

async function getLatestLogs(limit = 20) {
  return prisma.auditLogEntry.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit
  });
}

module.exports = {
  createAuditLog,
  getLatestLogs
};