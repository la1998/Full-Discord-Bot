require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  StringSelectMenuOptionBuilder,
  PermissionsBitField,
} = require('discord.js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ✅ ZENTRAL: Gamer/in Rolle (Spacer)
// Fallback verhindert Crash, falls .env fehlt
const GAMER_ROLE_ID = process.env.GAMER_ROLE_ID || '1291350678098153473';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

async function deployCommand() {
  const command = new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Öffnet ein Auswahlmenü für Rollen-Panels')
    .toJSON();

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log('📡 Registriere /panel Command...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [command] }
    );
    console.log('✅ /panel erfolgreich registriert!');
  } catch (error) {
    console.error('❌ Fehler bei der Registrierung:', error);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot ist bereit als ${client.user.tag}`);
  deployCommand();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isStringSelectMenu()) return;

  // 🔐 Zugriffsbeschränkung
  if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '🚫 Du benötigst Administratorrechte, um diesen Befehl zu verwenden.',
        ephemeral: true,
      });
    }

    const panels = await prisma.panel.findMany();
    if (panels.length === 0) {
      return interaction.reply({ content: '❌ Es sind keine Panels vorhanden.', ephemeral: true });
    }

    const panelOptions = panels.map(panel => {
      const option = new StringSelectMenuOptionBuilder()
        .setLabel(panel.name)
        .setValue(panel.id);

      if (panel.description) {
        option.setDescription(panel.description.slice(0, 100));
      }
      return option;
    });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('panel-selector')
      .setPlaceholder('🔽 Wähle ein Panel zur Veröffentlichung')
      .addOptions(panelOptions);

    return interaction.reply({
      content: 'Wähle ein Panel, das gepostet werden soll:',
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true
    });
  }

  // 📦 Panel-Auswahl
  if (interaction.isStringSelectMenu() && interaction.customId === 'panel-selector') {
    const panel = await prisma.panel.findUnique({
      where: { id: interaction.values[0] },
      include: { roles: true }
    });

    if (!panel || panel.roles.length === 0) {
      return interaction.reply({ content: '❌ Panel oder Rollen nicht gefunden.', ephemeral: true });
    }

    const roleMenu = new StringSelectMenuBuilder()
      .setCustomId(`role-selector-${panel.id}`)
      .setPlaceholder('🎭 Wähle deine Rolle')
      .addOptions(
        panel.roles.map(role =>
          new StringSelectMenuOptionBuilder()
            .setLabel(role.label)
            .setValue(role.roleId)
        )
      );

    return interaction.reply({
      content: `📌 **${panel.name}**\n${panel.description || ''}`,
      components: [new ActionRowBuilder().addComponents(roleMenu)],
      ephemeral: false
    });
  }

  // 🎭 ROLE TOGGLE (HIER IST DIE ÄNDERUNG)
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('role-selector-')) {
    const selectedRoleId = interaction.values[0];
    const guild = interaction.guild;
    const member = await guild.members.fetch(interaction.user.id);

    const role = guild.roles.cache.get(selectedRoleId);
    if (!role) {
      return interaction.reply({ content: '❌ Diese Rolle existiert nicht mehr.', ephemeral: true });
    }

    let action = '';

    try {
      const me = guild.members.me ?? await guild.members.fetch(client.user.id);
      if (!me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({
          content: '❌ Bot fehlt die Berechtigung **Rollen verwalten**.',
          ephemeral: true,
        });
      }

      const botHighest = me.roles.highest;
      if (botHighest.position <= role.position) {
        return interaction.reply({
          content: `❌ Ich darf diese Rolle nicht vergeben (Rollen-Hierarchie).`,
          ephemeral: true,
        });
      }

      if (member.roles.cache.has(selectedRoleId)) {
        // ➖ Entfernen → Gamer/in bleibt UNBERÜHRT
        await member.roles.remove(selectedRoleId);
        action = 'entfernt';
      } else {
        // ➕ Hinzufügen → Gamer/in sicherstellen
        try {
          const gamerRole = guild.roles.cache.get(GAMER_ROLE_ID);
          if (
            gamerRole &&
            !member.roles.cache.has(GAMER_ROLE_ID) &&
            botHighest.position > gamerRole.position
          ) {
            await member.roles.add(GAMER_ROLE_ID);
          }
        } catch (e) {
          console.warn('[Gamer/in AutoAdd] Ignoriert:', e.message);
        }

        await member.roles.add(selectedRoleId);
        action = 'hinzugefügt';
      }
    } catch (err) {
      console.error('[Role Toggle] Failed:', err);
      return interaction.reply({
        content: '❌ Konnte Rolle nicht ändern (Rechte oder Hierarchie).',
        ephemeral: true,
      });
    }

    const panelId = interaction.customId.replace('role-selector-', '');
    const panel = await prisma.panel.findUnique({
      where: { id: panelId },
      include: { roles: true }
    });

    // 📈 Logging
    await prisma.auditLog.create({
      data: {
        userId: member.id,
        username: member.user.username,
        roleId: role.id,
        roleName: role.name,
        action,
        panelId: panel.id
      }
    });

    await prisma.role.updateMany({
      where: { roleId: role.id },
      data: { count: { increment: action === 'hinzugefügt' ? 1 : -1 } }
    });

    await interaction.update({
      content: `📌 **${panel.name}**\n${panel.description || ''}`,
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`role-selector-${panel.id}`)
            .setPlaceholder('🎭 Wähle deine Rolle')
            .addOptions(
              panel.roles.map(role =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(role.label)
                  .setValue(role.roleId)
              )
            )
        )
      ]
    });

    await interaction.followUp({
      content: `✅ Rolle **${role.name}** wurde dir ${action}.`,
      ephemeral: true
    });
  }
});

client.login(TOKEN);