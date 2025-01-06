const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getServers } = require('../utils/database');
const { 
  createServerInfoEmbed,
  createErrorEmbed
} = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Muestra información detallada de una copia de servidor')
    .addStringOption(option =>
      option
        .setName('nombre')
        .setDescription('Nombre de la copia a consultar')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const name = interaction.options.getString('nombre');
      const servers = await getServers();
      
      const server = servers.find(s => s.name.toLowerCase() === name.toLowerCase());
      
      if (!server) {
        const errorEmbed = createErrorEmbed(
          'Copia no encontrada',
          `No se encontró ninguna copia con el nombre "${name}".`
        );
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      const embed = createServerInfoEmbed(server, server.server_data);
      
      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Error en comando info:', error);
      const errorEmbed = createErrorEmbed(
        'Error',
        'Se produjo un error al obtener la información del servidor.'
      );
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};