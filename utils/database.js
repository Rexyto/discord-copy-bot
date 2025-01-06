const mysql = require('mysql2/promise');
const config = require('../config.json');

async function setupDatabase() {
  const connection = await mysql.createConnection(config.database);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS saved_servers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      server_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.end();
}

async function saveServer(name, serverData) {
  const connection = await mysql.createConnection(config.database);
  
  // Asegurarse de que serverData sea un string JSON válido
  const jsonData = typeof serverData === 'string' ? serverData : JSON.stringify(serverData);
  
  await connection.execute(
    'INSERT INTO saved_servers (name, server_data) VALUES (?, ?)',
    [name, jsonData]
  );

  await connection.end();
}

async function getServers() {
  const connection = await mysql.createConnection(config.database);
  
  const [rows] = await connection.execute('SELECT * FROM saved_servers ORDER BY created_at DESC');
  
  // Parsear el JSON antes de devolverlo
  const servers = rows.map(row => ({
    ...row,
    server_data: typeof row.server_data === 'string' ? 
      JSON.parse(row.server_data) : 
      row.server_data
  }));
  
  await connection.end();
  return servers;
}

async function deleteServer(id) {
  const connection = await mysql.createConnection(config.database);
  
  await connection.execute('DELETE FROM saved_servers WHERE id = ?', [id]);
  
  await connection.end();
}

module.exports = {
  setupDatabase,
  saveServer,
  getServers,
  deleteServer
};