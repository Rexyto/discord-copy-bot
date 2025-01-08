const { EmbedBuilder } = require('discord.js');
const { COLORS, EMOJIS } = require('../utils/embeds');

module.exports = {
  name: 'help',
  execute(message) {
    const config = require('../config.json');
    const isSpanish = config.settings.language === 'es';

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJIS.INFO} ${isSpanish ? 'Ayuda del Bot' : 'Bot Help'}`)
      .setDescription(isSpanish ? 
        'Aquí tienes una lista de todos los comandos disponibles:' : 
        'Here is a list of all available commands:'
      )
      .addFields(
        {
          name: `${EMOJIS.SERVER} ${isSpanish ? 'Comandos de Backup' : 'Backup Commands'}`,
          value: [
            '`/copy` - ' + (isSpanish ? 'Crea una copia del servidor' : 'Create a server backup'),
            '`/paste` - ' + (isSpanish ? 'Restaura una copia' : 'Restore a backup'),
            '`/delete` - ' + (isSpanish ? 'Elimina una copia' : 'Delete a backup'),
            '`/list` - ' + (isSpanish ? 'Lista todas las copias' : 'List all backups'),
            '`/info` - ' + (isSpanish ? 'Muestra información de una copia' : 'Show backup information')
          ].join('\n')
        },
        {
          name: `${EMOJIS.CONFIG} ${isSpanish ? 'Configuración' : 'Configuration'}`,
          value: [
            '`/backups` - ' + (isSpanish ? 'Configura backups automáticos' : 'Configure automatic backups'),
            '`/language` - ' + (isSpanish ? 'Cambia el idioma del bot' : 'Change bot language'),
            '`/web` - ' + (isSpanish ? 'Abre el panel de control web' : 'Open web control panel')
          ].join('\n')
        },
        {
          name: `${EMOJIS.INFO} ${isSpanish ? 'Comandos Básicos' : 'Basic Commands'}`,
          value: [
            '`!back` - ' + (isSpanish ? 'Muestra el último backup' : 'Show last backup'),
            '`!stats` - ' + (isSpanish ? 'Muestra estadísticas del servidor' : 'Show server statistics'),
            '`!ping` - ' + (isSpanish ? 'Comprueba la latencia del bot' : 'Check bot latency'),
            '`!help` - ' + (isSpanish ? 'Muestra este mensaje' : 'Show this message')
          ].join('\n')
        }
      )
      .setFooter({ 
        text: isSpanish ? 
          'Usa los comandos con el prefijo ! o /' : 
          'Use commands with prefix ! or /' 
      });

    message.reply({ embeds: [embed] });
  },
};