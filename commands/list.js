const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getServers } = require('../utils/database');
const { 
  createServerListDetailedEmbed,
  createErrorEmbed
} = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Muestra todas las copias de servidores guardadas')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const servers = await getServers();
      
      if (servers.length === 0) {
        const errorEmbed = createErrorEmbed(
          'No hay copias guardadas',
          'No se encontraron configuraciones de servidor guardadas.'
        );
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      const embed = createServerListDetailedEmbed(servers);
      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Error en comando list:', error);
      const errorEmbed = createErrorEmbed(
        'Error',
        'Se produjo un error al obtener la lista de servidores.'
      );
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};