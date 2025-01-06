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
  TIME: '🕒',
  TRASH: '🗑️'
};

function createProgressEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(title)
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

function createServerCopyEmbed(name, serverData, timeElapsed) {
  const totalChannels = serverData.categories.reduce((acc, cat) => acc + cat.channels.length, 0);

  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} Copia Completada: ${name}`)
    .setDescription('La configuración del servidor ha sido guardada exitosamente.')
    .addFields(
      {
        name: `${EMOJIS.SERVER} Información del Servidor`,
        value: `**Nombre:** ${serverData.name}`,
        inline: false
      },
      {
        name: `${EMOJIS.ROLES} Roles Copiados`,
        value: `${serverData.roles.length} roles`,
        inline: true
      },
      {
        name: `${EMOJIS.CATEGORY} Categorías`,
        value: `${serverData.categories.length} categorías`,
        inline: true
      },
      {
        name: `${EMOJIS.CHANNELS} Canales`,
        value: `${totalChannels} canales`,
        inline: true
      },
      {
        name: '⏱️ Tiempo de Proceso',
        value: `${timeElapsed} segundos`,
        inline: false
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Usa /paste para restaurar esta configuración' });
}

function createServerRestoreEmbed(name, serverData) {
  const totalChannels = serverData.categories.reduce((acc, cat) => acc + cat.channels.length, 0);

  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} Restauración Completada`)
    .setDescription(`La configuración "${name}" ha sido restaurada exitosamente.`)
    .addFields(
      {
        name: `${EMOJIS.ROLES} Roles Restaurados`,
        value: `${serverData.roles.length} roles`,
        inline: true
      },
      {
        name: `${EMOJIS.CATEGORY} Categorías`,
        value: `${serverData.categories.length} categorías`,
        inline: true
      },
      {
        name: `${EMOJIS.CHANNELS} Canales`,
        value: `${totalChannels} canales`,
        inline: true
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Restauración completada' });
}

function createServerListEmbed(action) {
  const titles = {
    'delete': '🗑️ Eliminar Configuración',
    'paste': '📋 Restaurar Configuración'
  };

  const descriptions = {
    'delete': 'Selecciona la configuración que deseas eliminar',
    'paste': 'Selecciona la configuración que deseas restaurar'
  };

  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(titles[action])
    .setDescription(descriptions[action])
    .setTimestamp();
}

function createServerDeletedEmbed(name) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} Configuración Eliminada`)
    .setDescription(`La configuración "${name}" ha sido eliminada exitosamente.`)
    .setTimestamp()
    .setFooter({ text: 'Eliminación completada' });
}

function createServerListDetailedEmbed(servers) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.SERVER} Copias de Servidor Guardadas`)
    .setDescription('Lista detallada de todas las configuraciones guardadas.')
    .setTimestamp();

  servers.forEach((server, index) => {
    const data = server.server_data;
    const totalChannels = data.categories.reduce((acc, cat) => acc + cat.channels.length, 0);
    
    embed.addFields({
      name: `${index + 1}. ${server.name}`,
      value: [
        `${EMOJIS.ROLES} **Roles:** ${data.roles.length}`,
        `${EMOJIS.CATEGORY} **Categorías:** ${data.categories.length}`,
        `${EMOJIS.CHANNELS} **Canales:** ${totalChannels}`,
        `${EMOJIS.TIME} **Creado:** ${new Date(server.created_at).toLocaleString()}`,
        '─────────────────'
      ].join('\n')
    });
  });

  embed.setFooter({ 
    text: `Total de copias: ${servers.length}` 
  });

  return embed;
}

function createServerInfoEmbed(server, data) {
  const totalChannels = data.categories.reduce((acc, cat) => acc + cat.channels.length, 0);
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.INFO} Información de Copia: ${server.name}`)
    .setDescription('Detalles completos de la configuración guardada.')
    .addFields(
      {
        name: `${EMOJIS.SERVER} Información General`,
        value: [
          `**Nombre:** ${data.name}`,
          `**Creado:** ${new Date(server.created_at).toLocaleString()}`,
          `**ID:** ${server.id}`,
          '─────────────────'
        ].join('\n'),
        inline: false
      },
      {
        name: `${EMOJIS.ROLES} Roles (${data.roles.length})`,
        value: data.roles.length > 0 
          ? data.roles.slice(0, 10).map(r => `• ${r.name}`).join('\n') + 
            (data.roles.length > 10 ? '\n*...y más roles*' : '')
          : 'No hay roles',
        inline: true
      },
      {
        name: `${EMOJIS.CATEGORY} Estructura (${data.categories.length} categorías)`,
        value: data.categories.length > 0
          ? data.categories.slice(0, 10).map(c => 
              `• ${c.name} (${c.channels.length} canales)`
            ).join('\n') + 
            (data.categories.length > 10 ? '\n*...y más categorías*' : '')
          : 'No hay categorías',
        inline: true
      }
    )
    .addFields({
      name: '📊 Resumen',
      value: [
        `${EMOJIS.ROLES} **Total Roles:** ${data.roles.length}`,
        `${EMOJIS.CATEGORY} **Total Categorías:** ${data.categories.length}`,
        `${EMOJIS.CHANNELS} **Total Canales:** ${totalChannels}`
      ].join('\n'),
      inline: false
    })
    .setTimestamp()
    .setFooter({ 
      text: 'Usa /paste para restaurar esta configuración' 
    });

  return embed;
}

module.exports = {
  COLORS,
  EMOJIS,
  createProgressEmbed,
  createErrorEmbed,
  createServerCopyEmbed,
  createServerRestoreEmbed,
  createServerListEmbed,
  createServerDeletedEmbed,
  createServerListDetailedEmbed,
  createServerInfoEmbed
};