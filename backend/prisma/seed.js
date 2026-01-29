const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const panel = await prisma.panel.create({
    data: {
      command: 'spiele-panel',
      title: '🎮 Spiele-Kategorien',
      description: 'Wähle deine Spiele-Genres',
      roles: {
        create: [
          { id: '1291350678098153473', label: '🎯 Egoshooters' },
          { id: '1291503691840618516', label: '🧙 MMORPGs' },
          { id: '1291513423699509270', label: '🚜 Simulatoren' },
        ]
      }
    }
  });

  console.log('✅ Seed erfolgreich!');
}

main().finally(() => prisma.$disconnect());
