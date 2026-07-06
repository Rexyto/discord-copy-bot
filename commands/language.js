const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { createLanguageEmbed, createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Cambia el idioma del bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const configPath = path.join(__dirname, '..', 'config.json');
    let config;

    try {
      // Cargar configuración del archivo
      config = require(configPath);
    } catch (error) {
      console.error('Error al cargar config.json:', error);
      const errorEmbed = createErrorEmbed(
        'Error',
        'No se pudo cargar la configuración del bot. Por favor, verifica el archivo config.json.'
      );
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const languageMenu = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_language')
            .setPlaceholder('Selecciona un idioma')
            .addOptions([
              {
                label: 'Español',
                value: 'es',
                description: 'Usar el bot en español',
                emoji: '🇪🇸',
                default: config.settings.language === 'es'
              },
              {
                label: 'English',
                value: 'en',
                description: 'Use the bot in English',
                emoji: '🇬🇧',
                default: config.settings.language === 'en'
              }
            ])
        );

      const embed = createLanguageEmbed(config.settings.language);
      await interaction.reply({
        embeds: [embed],
        components: [languageMenu],
        ephemeral: true
      });

      const filter = i => i.customId === 'select_language' && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        const selectedLanguage = i.values[0];
        config.settings.language = selectedLanguage;

        try {
          await fs.writeFile(configPath, JSON.stringify(config, null, 2));

          const successEmbed = createSuccessEmbed(
            selectedLanguage === 'es' ? 'Idioma Actualizado' : 'Language Updated',
            selectedLanguage === 'es'
              ? 'El idioma del bot ha sido cambiado a Español'
              : 'Bot language has been changed to English'
          );

          if (!i.replied && !i.deferred) {
            await i.update({
              embeds: [successEmbed],
              components: []
            });
          }
        } catch (writeError) {
          console.error('Error al guardar config.json:', writeError);
          const errorEmbed = createErrorEmbed(
            'Error',
            'No se pudo guardar la configuración. Por favor, verifica los permisos del archivo config.json.'
          );
          if (!i.replied && !i.deferred) {
            await i.reply({ embeds: [errorEmbed], ephemeral: true });
          }
        }
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          const timeoutEmbed = createErrorEmbed(
            config.settings.language === 'es' ? 'Tiempo Agotado' : 'Time Out',
            config.settings.language === 'es'
              ? 'Se agotó el tiempo para seleccionar un idioma'
              : 'Time to select a language has expired'
          );
          try {
            await interaction.editReply({
              embeds: [timeoutEmbed],
              components: []
            });
          } catch (editError) {
            console.error('Error al editar la respuesta al expirar:', editError);
          }
        }
      });
    } catch (error) {
      console.error('Error en comando language:', error);
      const errorEmbed = createErrorEmbed(
        config.settings.language === 'es' ? 'Error' : 'Error',
        config.settings.language === 'es'
          ? 'Se produjo un error al ejecutar el comando'
          : 'An error occurred while executing the command'
      );
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        console.error('Error al enviar respuesta de error:', replyError);
      }
    }
  },
};
