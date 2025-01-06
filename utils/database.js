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
  
  await connection.execute(
    'INSERT INTO saved_servers (name, server_data) VALUES (?, ?)',
    [name, JSON.stringify(serverData)]
  );

  await connection.end();
}

async function getServers() {
  const connection = await mysql.createConnection(config.database);
  
  const [rows] = await connection.execute('SELECT * FROM saved_servers');
  
  await connection.end();
  return rows;
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