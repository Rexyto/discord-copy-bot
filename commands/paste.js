const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getServers } = require('../utils/database');
const { 
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
    .setDescription('Restaura una copia de servidor guardada')
    .addStringOption(option =>
      option
        .setName('nombre')
        .setDescription('Nombre de la copia a restaurar')
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

      await interaction.deferReply({ ephemeral: true });

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

      const progressMessage = await channel.send({ 
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
      await interaction.editReply({ embeds: [completionEmbed] });

    } catch (error) {
      console.error(error);
      const errorEmbed = createErrorEmbed(
        'Error al Restaurar',
        'Se produjo un error al restaurar la configuración del servidor.'
      );
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};