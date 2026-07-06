const { EmbedBuilder } = require('discord.js');

const COLORS = {
  SUCCESS: 0x57F287,
  ERROR: 0xED4245,
  INFO: 0x5865F2,
  WARNING: 0xFEE75C
};

const EMOJIS = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  LOADING: '⏳',
  SERVER: '🏰',
  ROLES: '👥',
  CHANNELS: '📝',
  CATEGORY: '📁',
  TIME: '⏰',
  TRASH: '🗑️',
  BACKUP: '💾',
  CONFIG: '⚙️',
  LANGUAGE: '🌐'
};

function createLanguageEmbed(currentLanguage) {
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.LANGUAGE} Selección de Idioma`)
    .setDescription(currentLanguage === 'es' ? 
      'Selecciona el idioma que deseas usar:' : 
      'Select the language you want to use:')
    .setTimestamp();
}

function createBackupEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.BACKUP} ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle(`${EMOJIS.ERROR} ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: 'Se produjo un error' });
}

function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function createBackupConfigEmbed(channelName, backupCount, interval) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.CONFIG} Configuración de Backups`)
    .setDescription('Sistema de backups automáticos configurado exitosamente.')
    .addFields(
      {
        name: `${EMOJIS.CHANNELS} Canal de Notificaciones`,
        value: `#${channelName}`,
        inline: true
      },
      {
        name: `${EMOJIS.BACKUP} Cantidad de Backups`,
        value: `${backupCount} copias`,
        inline: true
      },
      {
        name: `${EMOJIS.TIME} Intervalo`,
        value: `Cada ${interval}`,
        inline: true
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Sistema Activo' });
}

function createLastBackupEmbed(lastBackup, backupContent) {
  const data = typeof backupContent === 'string' ? 
    JSON.parse(backupContent) : backupContent;

  const totalChannels = data.categories.reduce((acc, cat) => acc + cat.channels.length, 0);
  const date = new Date(lastBackup).toLocaleString();

  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.BACKUP} Último Backup Realizado`)
    .setDescription(`Backup realizado el ${date}`)
    .addFields(
      {
        name: `${EMOJIS.SERVER} Información del Servidor`,
        value: `**Nombre:** ${data.name}`,
        inline: false
      },
      {
        name: `${EMOJIS.ROLES} Roles Guardados`,
        value: `${data.roles.length} roles`,
        inline: true
      },
      {
        name: `${EMOJIS.CATEGORY} Categorías`,
        value: `${data.categories.length} categorías`,
        inline: true
      },
      {
        name: `${EMOJIS.CHANNELS} Canales`,
        value: `${totalChannels} canales`,
        inline: true
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Sistema de Backups Automáticos' });
}

function createServerListEmbed(action) {
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.SERVER} Servidores Guardados`)
    .setDescription(action === 'delete' ? 
      'Selecciona el servidor que deseas eliminar:' :
      'Selecciona el servidor que deseas restaurar:')
    .setTimestamp();
}

function createServerInfoEmbed(server, data) {
  const totalChannels = data.categories.reduce((acc, cat) => acc + cat.channels.length, 0);
  
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.INFO} Información del Backup`)
    .setDescription(`Backup: **${server.name}**`)
    .addFields(
      {
        name: `${EMOJIS.SERVER} Servidor`,
        value: data.name,
        inline: true
      },
      {
        name: `${EMOJIS.ROLES} Roles`,
        value: `${data.roles.length} roles`,
        inline: true
      },
      {
        name: `${EMOJIS.CATEGORY} Categorías`,
        value: `${data.categories.length} categorías`,
        inline: true
      },
      {
        name: `${EMOJIS.CHANNELS} Canales`,
        value: `${totalChannels} canales`,
        inline: true
      },
      {
        name: '📅 Creado',
        value: new Date(server.created_at).toLocaleString(),
        inline: true
      }
    )
    .setTimestamp();
}

function createServerListDetailedEmbed(servers) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.SERVER} Lista de Backups`)
    .setDescription('Aquí tienes una lista de todos los backups guardados:')
    .setTimestamp();

  servers.forEach(server => {
    const data = typeof server.server_data === 'string' ? 
      JSON.parse(server.server_data) : server.server_data;
    
    const totalChannels = data.categories.reduce((acc, cat) => acc + cat.channels.length, 0);
    
    embed.addFields({
      name: `${EMOJIS.BACKUP} ${server.name}`,
      value: [
        `${EMOJIS.ROLES} ${data.roles.length} roles`,
        `${EMOJIS.CATEGORY} ${data.categories.length} categorías`,
        `${EMOJIS.CHANNELS} ${totalChannels} canales`,
        `📅 ${new Date(server.created_at).toLocaleString()}`
      ].join('\n'),
      inline: false
    });
  });

  return embed;
}

function createServerRestoreEmbed(serverName, data) {
  const totalChannels = data.categories.reduce((acc, cat) => acc + cat.channels.length, 0);
  
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} Servidor Restaurado`)
    .setDescription(`La configuración de **${serverName}** ha sido restaurada exitosamente.`)
    .addFields(
      {
        name: `${EMOJIS.ROLES} Roles Restaurados`,
        value: `${data.roles.length} roles`,
        inline: true
      },
      {
        name: `${EMOJIS.CATEGORY} Categorías Restauradas`,
        value: `${data.categories.length} categorías`,
        inline: true
      },
      {
        name: `${EMOJIS.CHANNELS} Canales Restaurados`,
        value: `${totalChannels} canales`,
        inline: true
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Restauración Completada' });
}

function createProgressEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.LOADING} ${title}`)
    .setDescription(description)
    .setTimestamp();
}

module.exports = {
  COLORS,
  EMOJIS,
  createLanguageEmbed,
  createBackupEmbed,
  createErrorEmbed,
  createSuccessEmbed,
  createBackupConfigEmbed,
  createLastBackupEmbed,
  createServerListEmbed,
  createServerInfoEmbed,
  createServerListDetailedEmbed,
  createServerRestoreEmbed,
  createProgressEmbed
};