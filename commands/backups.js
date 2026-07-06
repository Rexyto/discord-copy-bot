const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { createBackupEmbed, createErrorEmbed, createBackupConfigEmbed, EMOJIS } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backups')
    .setDescription('Configura el sistema de backups automáticos')
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal donde se enviarán las notificaciones de backups')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('cantidad')
        .setDescription('Número de backups a mantener (1-4)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(4)
    ),

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel('canal');
      const backupCount = interaction.options.getInteger('cantidad');
      const configPath = path.join(__dirname, '..', 'config.json');

      // Crear menú de selección de intervalos
      const intervals = {
        1: ['24h', '12h', '6h', '3h'],
        2: ['12h', '6h', '3h', '1h'],
        3: ['8h', '4h', '2h', '1h'],
        4: ['6h', '3h', '2h', '1h']
      };

      const selectMenu = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('backup_interval')
            .setPlaceholder('Selecciona el intervalo entre backups')
            .addOptions(
              intervals[backupCount].map(interval => ({
                label: `Cada ${interval}`,
                value: interval,
                emoji: EMOJIS.TIME
              }))
            )
        );

      const config = require('../config.json');
      
      if (!channel.permissionsFor(interaction.guild.members.me).has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
        const errorEmbed = createErrorEmbed(
          'Error de Permisos',
          'No tengo los permisos necesarios en el canal seleccionado.'
        );
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Guardar canal temporalmente
      config.settings.backupChannel = channel.id;
      config.settings.maxBackups = backupCount;
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));

      // Enviar mensaje con menú de selección
      await interaction.reply({
        embeds: [createBackupEmbed(
          'Configuración de Backups',
          'Por favor, selecciona el intervalo entre backups:'
        )],
        components: [selectMenu],
        ephemeral: true
      });

      // Collector para el menú
      const filter = i => i.customId === 'backup_interval' && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        const interval = i.values[0];
        config.settings.backupInterval = interval;
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));

        const configEmbed = createBackupConfigEmbed(
          channel.name,
          backupCount,
          interval
        );

        await channel.send({ embeds: [configEmbed] });
        await i.update({
          embeds: [createBackupEmbed(
            'Configuración Completada',
            `Sistema configurado en ${channel} con ${backupCount} backups cada ${interval}.`
          )],
          components: []
        });
      });

    } catch (error) {
      console.error('Error en comando backups:', error);
      const errorEmbed = createErrorEmbed(
        'Error',
        'Se produjo un error al configurar el sistema de backups.'
      );
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};