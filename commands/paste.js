const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');
const { getServers } = require('../utils/database');
const { 
  createServerListEmbed, 
  createServerRestoreEmbed,
  createProgressEmbed,
  createErrorEmbed,
  EMOJIS 
} = require('../utils/embeds');

async function findWritableChannel(guild) {
  // Primero buscar en canales de texto
  const textChannels = guild.channels.cache.filter(
    channel => channel.type === ChannelType.GuildText && 
    channel.permissionsFor(guild.members.me).has('SendMessages')
  );
  
  if (textChannels.size > 0) {
    return textChannels.first();
  }

  // Si no hay canales de texto, crear uno nuevo
  try {
    return await guild.channels.create({
      name: 'general',
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
        }
      ]
    });
  } catch (error) {
    console.error('Error al crear canal:', error);
    return null;
  }
}

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
        let progressMessage = null;
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

          // Encontrar un canal donde podamos escribir
          const channel = await findWritableChannel(guild);
          if (!channel) {
            throw new Error('No se pudo encontrar ni crear un canal para escribir mensajes');
          }

          progressMessage = await channel.send({ 
            embeds: [progressEmbed]
          });

          // Primero, actualizar permisos de @everyone
          if (serverData.everyonePerms) {
            try {
              await guild.roles.everyone.setPermissions(BigInt(serverData.everyonePerms));
            } catch (error) {
              console.error('Error al actualizar permisos de @everyone:', error);
            }
          }

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

          // Eliminar canales existentes (excepto el que estamos usando)
          for (const [id, chan] of guild.channels.cache) {
            if (chan.id !== channel.id) {
              try {
                await chan.delete();
              } catch (error) {
                console.error(`No se pudo eliminar el canal ${chan.name}:`, error);
              }
            }
          }

          // Esperar 1 segundo para asegurar que todo se eliminó
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Crear roles y mantener un mapeo de IDs
          const roleMap = new Map();
          roleMap.set(guild.roles.everyone.id, guild.roles.everyone.id);

          for (const roleData of serverData.roles.sort((a, b) => b.position - a.position)) {
            if (roleData.isEveryone) continue;
            try {
              const newRole = await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                permissions: BigInt(roleData.permissions),
                position: roleData.position
              });
              roleMap.set(roleData.id, newRole.id);
            } catch (error) {
              console.error(`No se pudo crear el rol ${roleData.name}:`, error);
            }
          }

          // Crear categorías y canales
          for (const categoryData of serverData.categories) {
            try {
              const updatedCategoryPermissions = categoryData.permissions.map(perm => ({
                id: perm.isEveryone ? guild.roles.everyone.id : 
                    (perm.isRole ? roleMap.get(perm.id) || perm.id : perm.id),
                type: perm.type,
                allow: BigInt(perm.allow),
                deny: BigInt(perm.deny)
              }));

              const category = await guild.channels.create({
                name: categoryData.name,
                type: ChannelType.GuildCategory,
                position: categoryData.position,
                permissionOverwrites: updatedCategoryPermissions
              });

              for (const channelData of categoryData.channels) {
                const updatedChannelPermissions = channelData.permissions.map(perm => ({
                  id: perm.isEveryone ? guild.roles.everyone.id : 
                      (perm.isRole ? roleMap.get(perm.id) || perm.id : perm.id),
                  type: perm.type,
                  allow: BigInt(perm.allow),
                  deny: BigInt(perm.deny)
                }));

                await guild.channels.create({
                  name: channelData.name,
                  type: channelData.type,
                  parent: category.id,
                  topic: channelData.topic,
                  position: channelData.position,
                  permissionOverwrites: updatedChannelPermissions
                });
              }
            } catch (error) {
              console.error(`No se pudo crear la categoría ${categoryData.name}:`, error);
            }
          }

          // Eliminar el canal temporal si fue creado por nosotros
          if (channel.name === 'general' && channel.createdTimestamp > interaction.createdTimestamp) {
            try {
              await channel.delete();
            } catch (error) {
              console.error('Error al eliminar canal temporal:', error);
            }
          }

          const completionEmbed = createServerRestoreEmbed(selectedServer.name, serverData);
          await interaction.followUp({ 
            embeds: [completionEmbed],
            ephemeral: true
          });

        } catch (error) {
          console.error(error);
          const errorEmbed = createErrorEmbed(
            'Error al Restaurar',
            'Se produjo un error al restaurar la configuración del servidor.'
          );
          await interaction.followUp({ 
            embeds: [errorEmbed], 
            ephemeral: true 
          });
        }
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = createErrorEmbed(
            'Tiempo Agotado',
            'Se agotó el tiempo para seleccionar un servidor.'
          );
          try {
            await interaction.followUp({
              embeds: [timeoutEmbed],
              ephemeral: true
            });
          } catch (error) {
            console.error('Error al enviar mensaje de timeout:', error);
          }
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
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};