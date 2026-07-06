const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { saveServer } = require('../utils/database');
const { createProgressBar } = require('../utils/progressBar');
const { 
  createProgressEmbed, 
  createServerCopyEmbed,
  createErrorEmbed,
  EMOJIS 
} = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('copy')
    .setDescription('Copy all server settings and structure')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Name for this server backup')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const name = interaction.options.getString('name');
      const guild = interaction.guild;
      
      const progressEmbed = createProgressEmbed(
        'Copiando Servidor',
        `${EMOJIS.LOADING} Iniciando proceso de copia...`
      );
      
      await interaction.reply({ embeds: [progressEmbed], ephemeral: true });

      const serverData = {
        name: guild.name,
        icon: guild.iconURL(),
        roles: [],
        channels: [],
        categories: [],
        everyonePerms: guild.roles.everyone.permissions.bitfield.toString() // Guardar permisos de @everyone
      };

      // Copiar roles
      const roles = await guild.roles.fetch();
      const totalSteps = roles.size + guild.channels.cache.size;
      let currentStep = 0;

      // Crear un mapa de roles para referencia posterior
      const roleMap = new Map();
      
      for (const [id, role] of roles) {
        if (role.managed) continue; // Solo saltamos roles manejados, pero incluimos @everyone
        
        const roleData = {
          id: role.id,
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          permissions: role.permissions.bitfield.toString(),
          position: role.position,
          isEveryone: role.name === '@everyone'
        };

        serverData.roles.push(roleData);
        roleMap.set(role.id, roleData);

        currentStep++;
        const progress = createProgressBar(currentStep, totalSteps);
        progressEmbed.setDescription(
          `${EMOJIS.LOADING} Copiando roles... ${progress.percentage}\n${progress.bar}`
        );
        await interaction.editReply({ embeds: [progressEmbed] });
      }

      // Copiar categorías y canales
      const categories = guild.channels.cache.filter(c => c.type === 4);
      for (const [id, category] of categories) {
        const categoryPermissions = category.permissionOverwrites.cache.map(perm => ({
          id: perm.id,
          type: perm.type,
          allow: perm.allow.bitfield.toString(),
          deny: perm.deny.bitfield.toString(),
          isRole: guild.roles.cache.has(perm.id),
          isEveryone: perm.id === guild.roles.everyone.id
        }));

        const categoryData = {
          name: category.name,
          position: category.position,
          permissions: categoryPermissions,
          channels: []
        };

        const channelsInCategory = guild.channels.cache.filter(c => c.parentId === category.id);
        for (const [channelId, channel] of channelsInCategory) {
          const channelPermissions = channel.permissionOverwrites.cache.map(perm => ({
            id: perm.id,
            type: perm.type,
            allow: perm.allow.bitfield.toString(),
            deny: perm.deny.bitfield.toString(),
            isRole: guild.roles.cache.has(perm.id),
            isEveryone: perm.id === guild.roles.everyone.id
          }));

          categoryData.channels.push({
            name: channel.name,
            type: channel.type,
            position: channel.position,
            topic: channel.topic,
            permissions: channelPermissions
          });

          currentStep++;
          const progress = createProgressBar(currentStep, totalSteps);
          progressEmbed.setDescription(
            `${EMOJIS.LOADING} Copiando canales... ${progress.percentage}\n${progress.bar}`
          );
          await interaction.editReply({ embeds: [progressEmbed] });
        }

        serverData.categories.push(categoryData);
      }

      await saveServer(name, serverData);

      const timeElapsed = ((Date.now() - interaction.createdTimestamp) / 1000).toFixed(2);
      const finalEmbed = createServerCopyEmbed(name, serverData, timeElapsed);
      await interaction.editReply({ embeds: [finalEmbed] });

    } catch (error) {
      console.error(error);
      const errorEmbed = createErrorEmbed(
        'Error al Copiar Servidor',
        'Se produjo un error al intentar copiar la configuración del servidor. Por favor, inténtalo de nuevo.'
      );
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};