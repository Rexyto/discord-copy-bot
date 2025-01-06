const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getServers } = require('../utils/database');
const { 
  createServerListEmbed, 
  createServerRestoreEmbed,
  createProgressEmbed,
  createErrorEmbed,
  EMOJIS 
} = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('paste')
    .setDescription('Paste a saved server configuration')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const servers = await getServers();
      
      if (servers.length === 0) {
        const errorEmbed = createErrorEmbed(
          'No hay servidores guardados',
          'No se encontraron configuraciones de servidor guardadas.'
        );
        return await interaction.reply({ 
          embeds: [errorEmbed], 
          ephemeral: true 
        });
      }

      const embed = createServerListEmbed('paste');
      const selectMenu = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_server')
            .setPlaceholder('Selecciona un servidor')
            .addOptions(
              servers.map(server => ({
                label: server.name,
                value: server.id.toString(),
                description: `Creado el ${new Date(server.created_at).toLocaleDateString()}`,
                emoji: EMOJIS.SERVER
              }))
            )
        );

      const reply = await interaction.reply({
        embeds: [embed],
        components: [selectMenu],
        ephemeral: true,
        fetchReply: true
      });

      const filter = i => i.customId === 'select_server' && i.user.id === interaction.user.id;
      const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        try {
          await i.deferUpdate();
          const selectedServer = servers.find(s => s.id.toString() === i.values[0]);
          
          const serverData = typeof selectedServer.server_data === 'string' 
            ? JSON.parse(selectedServer.server_data)
            : selectedServer.server_data;

          const guild = interaction.guild;

          const progressEmbed = createProgressEmbed(
            'Restaurando Servidor',
            `${EMOJIS.LOADING} Eliminando configuración actual...`
          );
          
          await i.editReply({ 
            embeds: [progressEmbed],
            components: []
          });

          // Eliminar roles existentes
          const roles = await guild.roles.fetch();
          for (const [id, role] of roles) {
            if (!role.managed && role.name !== '@everyone') {
              try {
                await role.delete();
              } catch (error) {
                console.error(`No se pudo eliminar el rol ${role.name}:`, error);
              }
            }
          }

          // Eliminar canales existentes
          for (const [id, channel] of guild.channels.cache) {
            try {
              await channel.delete();
            } catch (error) {
              console.error(`No se pudo eliminar el canal ${channel.name}:`, error);
            }
          }

          // Esperar 1 segundo
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Crear roles
          for (const roleData of serverData.roles.sort((a, b) => b.position - a.position)) {
            try {
              await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                permissions: BigInt(roleData.permissions),
                position: roleData.position
              });
            } catch (error) {
              console.error(`No se pudo crear el rol ${roleData.name}:`, error);
            }
          }

          // Crear categorías y canales
          for (const categoryData of serverData.categories) {
            try {
              const category = await guild.channels.create({
                name: categoryData.name,
                type: 4,
                position: categoryData.position,
                permissionOverwrites: categoryData.permissions.map(perm => ({
                  id: perm.id,
                  type: perm.type,
                  allow: BigInt(perm.allow),
                  deny: BigInt(perm.deny)
                }))
              });

              // Crear canales en la categoría
              for (const channelData of categoryData.channels) {
                await guild.channels.create({
                  name: channelData.name,
                  type: channelData.type,
                  parent: category.id,
                  topic: channelData.topic,
                  position: channelData.position,
                  permissionOverwrites: channelData.permissions.map(perm => ({
                    id: perm.id,
                    type: perm.type,
                    allow: BigInt(perm.allow),
                    deny: BigInt(perm.deny)
                  }))
                });
              }
            } catch (error) {
              console.error(`No se pudo crear la categoría ${categoryData.name}:`, error);
            }
          }

          const completionEmbed = createServerRestoreEmbed(selectedServer.name, serverData);
          await i.editReply({ embeds: [completionEmbed] });
        } catch (error) {
          console.error(error);
          const errorEmbed = createErrorEmbed(
            'Error al Restaurar',
            'Se produjo un error al restaurar la configuración del servidor.'
          );
          await i.editReply({ embeds: [errorEmbed], components: [] });
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
          }).catch(console.error);
        }
      });
    } catch (error) {
      console.error(error);
      const errorEmbed = createErrorEmbed(
        'Error',
        'Se produjo un error al procesar tu solicitud.'
      );
      if (!interaction.replied) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.editReply({ embeds: [errorEmbed] });
      }
    }
  },
};