const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getServers, deleteServer } = require('../utils/database');
const { 
  createSuccessEmbed,
  createErrorEmbed
} = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Elimina una copia de servidor guardada')
    .addStringOption(option =>
      option
        .setName('nombre')
        .setDescription('Nombre de la copia a eliminar')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const servers = await getServers();

    const filtered = servers
      .filter(s => s.name.toLowerCase().includes(focused))
      .slice(0, 25)
      .map(s => ({ name: s.name, value: s.name }));

    await interaction.respond(filtered);
  },

  async execute(interaction) {
    try {
      const name = interaction.options.getString('nombre');
      const servers = await getServers();

      const selectedServer = servers.find(s => s.name.toLowerCase() === name.toLowerCase());

      if (!selectedServer) {
        const errorEmbed = createErrorEmbed(
          'Copia no encontrada',
          `No se encontró ninguna copia con el nombre "${name}".`
        );
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      await deleteServer(selectedServer.id);

      const successEmbed = createSuccessEmbed(
        'Backup Eliminado',
        `La copia **${selectedServer.name}** ha sido eliminada correctamente.`
      );

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    } catch (error) {
      console.error(error);
      const errorEmbed = createErrorEmbed(
        'Error al Eliminar',
        'Se produjo un error al eliminar la configuración del servidor.'
      );
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};