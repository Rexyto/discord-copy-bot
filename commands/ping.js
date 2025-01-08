const { EmbedBuilder } = require('discord.js');
const { COLORS, EMOJIS } = require('../utils/embeds');

module.exports = {
  name: 'ping',
  execute(message) {
    const config = require('../config.json');
    const isSpanish = config.settings.language === 'es';

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJIS.INFO} Ping`)
      .addFields(
        {
          name: '🏓 Ping',
          value: `${message.client.ws.ping}ms`,
          inline: true
        },
        {
          name: '⏱️ ' + (isSpanish ? 'Latencia' : 'Latency'),
          value: `${Date.now() - message.createdTimestamp}ms`,
          inline: true
        }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};