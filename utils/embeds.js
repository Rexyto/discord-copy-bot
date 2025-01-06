const { EmbedBuilder } = require('discord.js');

const COLORS = {
  PRIMARY: '#5865F2',   // Discord Blurple
  SUCCESS: '#57F287',   // Verde vibrante
  ERROR: '#ED4245',     // Rojo suave
  WARNING: '#FEE75C',   // Amarillo
  INFO: '#5865F2',      // Azul Discord
  PROGRESS: '#5865F2'   // Azul proceso
};

const EMOJIS = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  LOADING: '⏳',
  SERVER: '🏰',
  ROLES: '👑',
  CHANNELS: '📝',
  CATEGORY: '📁',
  TIME: '⏰',
  TRASH: '🗑️',
  SAVE: '💾',
  PASTE: '📋'
};

function createProgressEmbed(title, description, progress) {
  return new EmbedBuilder()
    .setColor(COLORS.PROGRESS)
    .setTitle(`${EMOJIS.LOADING} ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: 'Procesando...' });
}

function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: '¡Operación completada con éxito!' });
}

function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle(`${EMOJIS.ERROR} ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: 'Se produjo un error' });
}

function createServerCopyEmbed(name, data, timeElapsed) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} ¡Servidor Copiado Exitosamente!`)
    .addFields(
      { name: `${EMOJIS.SERVER} Nombre de la copia`, value: `\`${name}\``, inline: false },
      { name: `${EMOJIS.ROLES} Roles`, value: `\`${data.roles.length}\` roles copiados`, inline: true },
      { name: `${EMOJIS.CATEGORY} Categorías`, value: `\`${data.categories.length}\` categorías`, inline: true },
      { name: `${EMOJIS.CHANNELS} Canales`, value: `\`${data.categories.reduce((acc, cat) => acc + cat.channels.length, 0)}\` canales`, inline: true },
      { name: `${EMOJIS.TIME} Tiempo total`, value: `\`${timeElapsed}\` segundos`, inline: false }
    )
    .setTimestamp()
    .setFooter({ text: '¡Copia completada!' });
}

function createServerListEmbed(action = 'paste') {
  const titles = {
    paste: 'Restaurar Configuración de Servidor',
    delete: 'Eliminar Configuración Guardada'
  };
  
  const descriptions = {
    paste: 'Selecciona el servidor que deseas restaurar',
    delete: 'Selecciona el servidor que deseas eliminar'
  };
  
  const emojis = {
    paste: EMOJIS.PASTE,
    delete: EMOJIS.TRASH
  };

  return new EmbedBuilder()
    .setColor(action === 'paste' ? COLORS.PRIMARY : COLORS.ERROR)
    .setTitle(`${emojis[action]} ${titles[action]}`)
    .setDescription(descriptions[action])
    .setTimestamp()
    .setFooter({ text: action === 'paste' ? 'Selecciona un servidor para restaurar' : 'Selecciona un servidor para eliminar' });
}

function createServerRestoreEmbed(name, data) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} ¡Servidor Restaurado Exitosamente!`)
    .addFields(
      { name: `${EMOJIS.SERVER} Configuración restaurada`, value: `\`${name}\``, inline: false },
      { name: `${EMOJIS.ROLES} Roles`, value: `\`${data.roles.length}\` roles creados`, inline: true },
      { name: `${EMOJIS.CATEGORY} Categorías`, value: `\`${data.categories.length}\` categorías`, inline: true },
      { name: `${EMOJIS.CHANNELS} Canales`, value: `\`${data.categories.reduce((acc, cat) => acc + cat.channels.length, 0)}\` canales`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: '¡Restauración completada!' });
}

function createServerDeletedEmbed(name) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} Configuración Eliminada`)
    .setDescription(`La configuración del servidor **${name}** ha sido eliminada exitosamente.`)
    .setTimestamp()
    .setFooter({ text: '¡Eliminación completada!' });
}

module.exports = {
  createProgressEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createServerCopyEmbed,
  createServerListEmbed,
  createServerRestoreEmbed,
  createServerDeletedEmbed,
  COLORS,
  EMOJIS
};