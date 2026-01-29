const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.login(process.env.DISCORD_TOKEN);

async function getRoleStats() {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  await guild.members.fetch(); // notwendig für member.roles.cache

  const roles = guild.roles.cache.filter(role => !role.managed && role.name !== '@everyone');

  const stats = {};
  for (const role of roles.values()) {
    const count = guild.members.cache.filter(member => member.roles.cache.has(role.id)).size;
    stats[role.name] = count;
  }

  return stats;
}

module.exports = { getRoleStats };
