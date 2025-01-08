const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const express = require('express');
const http = require('http');
const path = require('path');
const { getServers } = require('../utils/database');
const { createWebEmbed, createErrorEmbed } = require('../utils/embeds');

const app = express();
let server = null;

// Función para encontrar un puerto disponible
async function findAvailablePort(startPort = 3000) {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => findAvailablePort(startPort + 1).then(resolve, reject));
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('web')
    .setDescription('Abre el panel web de gestión de backups')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      // Si ya hay un servidor corriendo, usamos ese puerto
      if (server) {
        const port = server.address().port;
        const embed = createWebEmbed(`http://localhost:${port}`);
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const port = await findAvailablePort();
      
      // Configurar Express
      app.use(express.static(path.join(__dirname, '../public')));
      app.use(express.json());

      // API endpoints
      app.get('/api/backups', async (req, res) => {
        try {
          const servers = await getServers();
          res.json(servers);
        } catch (error) {
          console.error('Error al obtener backups:', error);
          res.status(500).json({ error: 'Error al obtener backups' });
        }
      });

      // Iniciar servidor
      server = app.listen(port, () => {
        console.log(`Panel web disponible en http://localhost:${port}`);
      });

      // Crear y enviar embed con el enlace
      const embed = createWebEmbed(`http://localhost:${port}`);
      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Error en comando web:', error);
      const errorEmbed = createErrorEmbed(
        'Error',
        'Se produjo un error al iniciar el panel web.'
      );
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};