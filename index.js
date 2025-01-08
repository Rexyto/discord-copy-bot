const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token } = require('./config.json');
const { setupDatabase } = require('./utils/database');
const { createLastBackupEmbed, createErrorEmbed } = require('./utils/embeds');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
client.prefixCommands = new Collection();

// Cargar comandos slash
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  // Comandos slash
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
  
  // Comandos con prefijo
  if ('name' in command && 'execute' in command && !('data' in command)) {
    client.prefixCommands.set(command.name, command);
  }
}

// Eventos
client.once('ready', async () => {
  console.log(`Bot logged in as ${client.user.tag}`);
  await setupDatabase();
});

// Manejar comandos con prefix
client.on('messageCreate', async message => {
  const config = require('./config.json');
  
  if (!message.content.startsWith(config.settings.prefix) || message.author.bot) return;

  const args = message.content.slice(config.settings.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.prefixCommands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    const errorEmbed = createErrorEmbed(
      'Error',
      'Hubo un error al ejecutar el comando.'
    );
    await message.reply({ embeds: [errorEmbed] });
  }
});

// Manejar comandos slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const errorEmbed = createErrorEmbed(
      'Error',
      'Hubo un error al ejecutar el comando.'
    );
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

client.login(token);