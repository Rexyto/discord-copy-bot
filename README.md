# Discord Server Copy Bot

Bot de Discord para hacer copias de seguridad de la estructura completa de un servidor: roles, categorías, canales y permisos, con restauración automatizada.

[Discord.js v14.14.1](https://discord.js.org) · [MySQL 5.7+](https://www.mysql.com/) · [Node.js 16.9.0+](https://nodejs.org) · Licencia MIT

## Características

- Copia completa de roles, categorías, canales y permisos.
- Restauración automatizada con verificación y manejo de errores.
- Sistema de backups automáticos configurable (canal de notificaciones, cantidad de copias e intervalo).
- Soporte de idioma en español e inglés (`/language`).

## Instalación

### Requisitos previos

```bash
node --version   # 16.9.0+
mysql --version  # 5.7+
npm --version
```

### Pasos

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Rexyto/discord-copy-bot.git
   cd discord-copy-bot
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea el archivo de configuración:
   ```bash
   cp config.example.json config.json
   ```
   Edita `config.json` con tus credenciales:
   ```json
   {
     "clientId": "TU_ID_DEL_BOT",
     "token": "TU_TOKEN_DEL_BOT",
     "database": {
       "host": "TU_HOST_DE_BASE_DE_DATOS",
       "user": "TU_USUARIO",
       "password": "TU_CONTRASEÑA",
       "database": "TU_BASE_DE_DATOS"
     },
     "settings": {
       "prefix": "!",
       "language": "es",
       "backupChannel": "TU_ID_DEL_CANAL_DE_RESPALDO",
       "maxBackups": 2,
       "backupInterval": "1h",
       "lastBackup": null,
       "lastBackupContent": null
     }
   }
   ```

4. Configura la base de datos:
   ```sql
   CREATE DATABASE discord_copy_bot;
   CREATE USER 'copybot'@'localhost' IDENTIFIED BY 'tu_contraseña';
   GRANT ALL PRIVILEGES ON discord_copy_bot.* TO 'copybot'@'localhost';
   FLUSH PRIVILEGES;
   ```

   El bot crea automáticamente las tablas que necesita al arrancar (`setupDatabase()` en `utils/database.js`), pero si prefieres crearlas tú mismo o revisar la estructura, esta es la tabla que usa:

   ```sql
   USE discord_copy_bot;

   CREATE TABLE IF NOT EXISTS saved_servers (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     server_data JSON NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

   | Columna | Tipo | Descripción |
   |---|---|---|
   | `id` | `INT AUTO_INCREMENT` | Identificador único del backup, usado por `/info`, `/delete` y `/paste`. |
   | `name` | `VARCHAR(255)` | Nombre que le diste al backup con `/copy`. |
   | `server_data` | `JSON` | Estructura completa del servidor: roles, categorías, canales y permisos. |
   | `created_at` | `TIMESTAMP` | Fecha de creación del backup, usada para ordenar `/list`. |

5. Despliega los comandos slash:
   ```bash
   node deploy-commands.js
   ```

6. Inicia el bot:
   ```bash
   node .
   ```

## Comandos

| Comando | Descripción | Uso | Permisos |
|---|---|---|---|
| `/copy` | Crea una copia del servidor | `/copy nombre:MiBackup` | Admin |
| `/paste` | Restaura una copia (autocompletado) | `/paste nombre:MiBackup` | Admin |
| `/delete` | Elimina una copia (autocompletado) | `/delete nombre:MiBackup` | Admin |
| `/list` | Lista todas las copias | `/list` | Admin |
| `/info` | Muestra información de una copia (autocompletado) | `/info nombre:MiBackup` | Admin |
| `/backups` | Configura backups automáticos | `/backups #canal cantidad:1-4` | Admin |
| `/language` | Cambia el idioma del bot | `/language` | Admin |
| `!back` | Muestra el último backup realizado | `!back` | Todos |
| `!stats` | Muestra estadísticas del servidor | `!stats` | Todos |
| `!help` | Muestra la ayuda del bot | `!help` | Todos |
| `!ping` | Comprueba la latencia del bot | `!ping` | Todos |

### Ejemplos

```bash
/copy nombre:Servidor-Principal
/paste nombre:Servidor-Principal
/list
```

`/info`, `/delete` y `/paste` sugieren nombres de backups guardados mientras escribes (autocompletado), no hace falta escribir el nombre exacto ni navegar un menú.

## Mantenimiento

- Si cambias las opciones de un comando slash (por ejemplo, al añadir autocompletado), vuelve a ejecutar `node deploy-commands.js` para que Discord registre los cambios.
- Actualizar dependencias: `npm update`
- Backup de la base de datos:
  ```bash
  mysqldump -u root -p discord_copy_bot > backup.sql
  ```
- Restaurar backup:
  ```bash
  mysql -u root -p discord_copy_bot < backup.sql
  ```

## Buenas prácticas de seguridad

- No compartas el token del bot; usa variables de entorno.
- Usa un usuario de base de datos con privilegios limitados.
- Mantén Node.js y las dependencias actualizadas.

## Preguntas frecuentes

**Cannot find module 'discord.js'**
```bash
npm install discord.js@14.14.1
```

**DiscordAPIError[50013]: Missing Permissions**
Verifica los permisos del bot y que su rol esté por encima en la jerarquía del servidor.

**Connection refused (MySQL)**
Comprueba que MySQL esté corriendo, las credenciales sean correctas y el firewall no bloquee la conexión.

## Recursos

- [Discord.js Guide](https://discordjs.guide/)
- [Discord API Documentation](https://discord.com/developers/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## Contribuir

1. Haz un fork del proyecto.
2. Crea tu rama: `git checkout -b feature/NuevaCaracteristica`
3. Commitea tus cambios: `git commit -am 'Add: nueva característica'`
4. Sube la rama: `git push origin feature/NuevaCaracteristica`
5. Abre un Pull Request.

## Licencia

MIT. Ver el archivo [LICENSE](LICENSE).

---

Hecho por [Rexyto](https://github.com/Rexyto)