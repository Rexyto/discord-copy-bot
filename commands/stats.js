const { EmbedBuilder } = require('discord.js');
const { COLORS, EMOJIS } = require('../utils/embeds');

module.exports = {
  name: 'stats',
  execute(message) {
    const guild = message.guild;
    const config = require('../config.json');
    const isSpanish = config.settings.language === 'es';

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJIS.INFO} ${isSpanish ? 'Estadísticas del Servidor' : 'Server Statistics'}`)
      .addFields(
        {
          name: `${EMOJIS.SERVER} ${isSpanish ? 'Información General' : 'General Information'}`,
          value: [
            `${isSpanish ? '• Nombre: ' : '• Name: '} ${guild.name}`,
            `${isSpanish ? '• ID: ' : '• ID: '} ${guild.id}`,
            `${isSpanish ? '• Creado: ' : '• Created: '} <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
            `${isSpanish ? '• Dueño: ' : '• Owner: '} <@${guild.ownerId}>`
          ].join('\n'),
          inline: false
        },
        {
          name: `${EMOJIS.ROLES} ${isSpanish ? 'Roles' : 'Roles'}`,
          value: `${guild.roles.cache.size} ${isSpanish ? 'roles' : 'roles'}`,
          inline: true
        },
        {
          name: `${EMOJIS.CHANNELS} ${isSpanish ? 'Canales' : 'Channels'}`,
          value: `${guild.channels.cache.size} ${isSpanish ? 'canales' : 'channels'}`,
          inline: true
        },
        {
          name: `👥 ${isSpanish ? 'Miembros' : 'Members'}`,
          value: `${guild.memberCount} ${isSpanish ? 'miembros' : 'members'}`,
          inline: true
        }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};