const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.login(process.env.DISCORD_TOKEN);

async function fetchRolesFromGuild() {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const roles = await guild.roles.fetch();

  return roles
    .filter(role => !role.managed && role.name !== '@everyone')
    .map(role => ({
      id: role.id,
      name: role.name
    }));
}

module.exports = { fetchRolesFromGuild };
