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

  // Zugriffsbeschränkung: Nur Administratoren dürfen /panel verwenden
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

      if (panel.description && panel.description.length > 0) {
        option.setDescription(panel.description.slice(0, 100));
      }

      return option;
    });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('panel-selector')
      .setPlaceholder('🔽 Wähle ein Panel zur Veröffentlichung')
      .addOptions(panelOptions);

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.reply({
      content: 'Wähle ein Panel, das gepostet werden soll:',
      components: [row],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'panel-selector') {
    const selectedPanelId = interaction.values[0];
    const panel = await prisma.panel.findUnique({
      where: { id: selectedPanelId },
      include: { roles: true }
    });

    if (!panel || panel.roles.length === 0) {
      return interaction.reply({ content: '❌ Panel oder Rollen nicht gefunden.', ephemeral: true });
    }

    const roleOptions = panel.roles.map(role =>
      new StringSelectMenuOptionBuilder()
        .setLabel(role.label)
        .setValue(role.roleId)
    );

    const roleMenu = new StringSelectMenuBuilder()
      .setCustomId(`role-selector-${panel.id}`)
      .setPlaceholder('🎭 Wähle deine Rolle')
      .addOptions(roleOptions);

    const row = new ActionRowBuilder().addComponents(roleMenu);

    return interaction.reply({
      content: `📌 **${panel.name}**\n${panel.description || ''}`,
      components: [row],
      ephemeral: false
    });
  }

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
  // Bot braucht Manage Roles
  const me = guild.members.me ?? (await guild.members.fetch(client.user.id));
  if (!me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
    return interaction.reply({
      content: "❌ Bot hat keine Berechtigung: **Rollen verwalten** (Manage Roles).",
      ephemeral: true,
    });
  }

  // Zielrolle muss unter der höchsten Bot-Rolle liegen
  const botHighest = me.roles.highest;
  if (botHighest.position <= role.position) {
    return interaction.reply({
      content: `❌ Ich darf diese Rolle nicht vergeben, weil meine höchste Rolle (**${botHighest.name}**) unter/gleich der Zielrolle (**${role.name}**) liegt.\n➡️ Bitte Bot-Rolle im Server über die Zielrolle schieben.`,
      ephemeral: true,
    });
  }

  if (member.roles.cache.has(selectedRoleId)) {
    await member.roles.remove(selectedRoleId);
    action = 'entfernt';
  } else {
    await member.roles.add(selectedRoleId);
    action = 'hinzugefügt';
  }
} catch (err) {
  console.error("[Role Toggle] Failed:", err);
  return interaction.reply({
    content: "❌ Konnte Rolle nicht ändern (fehlende Rechte oder Rollen-Hierarchie) Bitte melde dies per Support ticket.",
    ephemeral: true,
  });
}

    const panelId = interaction.customId.replace('role-selector-', '');
    const panel = await prisma.panel.findUnique({
      where: { id: panelId },
      include: { roles: true }
    });

    // 📈 Logging und Statistik aktualisieren
    await prisma.auditLog.create({
      data: {
        userId: member.id,
        username: member.user.username,
        roleId: role.id,
        roleName: role.name,
        action: action,
        panelId: panel.id
      }
    });

    await prisma.role.updateMany({
      where: { roleId: role.id },
      data: {
        count: { increment: action === 'hinzugefügt' ? 1 : -1 }
      }
    });

    const refreshedMenu = new StringSelectMenuBuilder()
      .setCustomId(`role-selector-${panel.id}`)
      .setPlaceholder('🎭 Wähle deine Rolle')
      .addOptions(
        panel.roles.map(role =>
          new StringSelectMenuOptionBuilder()
            .setLabel(role.label)
            .setValue(role.roleId)
        )
      );

    const row = new ActionRowBuilder().addComponents(refreshedMenu);

    await interaction.update({
      content: `📌 **${panel.name}**\n${panel.description || ''}`,
      components: [row]
    });

    await interaction.followUp({
      content: `✅ Rolle **${role.name}** wurde dir ${action}.`,
      ephemeral: true
    });
  }
});

client.login(TOKEN);
