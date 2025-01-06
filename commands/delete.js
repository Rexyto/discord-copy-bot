const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getServers, deleteServer } = require('../utils/database');
const { 
  createServerListEmbed, 
  createServerDeletedEmbed,
  createErrorEmbed,
  EMOJIS 
} = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete a saved server configuration')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const servers = await getServers();
      
      if (servers.length === 0) {
        const errorEmbed = createErrorEmbed(
          'No hay servidores guardados',
          'No se encontraron configuraciones de servidor para eliminar.'
        );
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      const embed = createServerListEmbed('delete');
      const selectMenu = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('delete_server')
            .setPlaceholder('Selecciona un servidor')
            .addOptions(
              servers.map(server => ({
                label: server.name,
                value: server.id.toString(),
                description: `Creado el ${new Date(server.created_at).toLocaleDateString()}`,
                emoji: EMOJIS.TRASH
              }))
            )
        );

      await interaction.reply({
        embeds: [embed],
        components: [selectMenu],
        ephemeral: true
      });

      const filter = i => i.customId === 'delete_server' && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        try {
          await i.deferUpdate();
          const selectedServer = servers.find(s => s.id.toString() === i.values[0]);
          
          await deleteServer(selectedServer.id);
          const completionEmbed = createServerDeletedEmbed(selectedServer.name);

          await interaction.editReply({
            embeds: [completionEmbed],
            components: []
          });
        } catch (error) {
          console.error(error);
          const errorEmbed = createErrorEmbed(
            'Error al Eliminar',
            'Se produjo un error al eliminar la configuración del servidor.'
          );
          await interaction.editReply({ embeds: [errorEmbed], components: [] });
        }
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          const timeoutEmbed = createErrorEmbed(
            'Tiempo Agotado',
            'Se agotó el tiempo para seleccionar un servidor.'
          );
          interaction.editReply({
            embeds: [timeoutEmbed],
            components: []
          });
        }
      });
    } catch (error) {
      console.error(error);
      const errorEmbed = createErrorEmbed(
        'Error',
        'Se produjo un error al procesar tu solicitud.'
      );
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};