# 🤖 Discord Server Copy Bot

<div align="center">

![Discord Server Copy Bot Banner](https://i.imgur.com/a/pLa2Gnv)

Un bot de Discord potente y fácil de usar que permite hacer copias de seguridad completas de la estructura de tu servidor.

[![Discord.js](https://img.shields.io/badge/discord.js-v14.14.1-blue.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org)
[![MySQL](https://img.shields.io/badge/MySQL-v5.7+-orange.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v16.9.0+-green.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-purple.svg?style=for-the-badge)](LICENSE)
[![Author](https://img.shields.io/badge/author-Rexyto-red.svg?style=for-the-badge&logo=github)](https://github.com/Rexyto)

[📘 Documentación](#-documentación) •
[🚀 Instalación](#-instalación) •
[💡 Uso](#-uso) •
[🤝 Contribuir](#-contribuir) •
[❓ FAQ](#-preguntas-frecuentes)

</div>

---

## 📋 Características Principales

### 🎯 Funcionalidades Core
- ✨ **Copia Completa del Servidor**
  - Estructura exacta de categorías y canales
  - Jerarquía de roles preservada
  - Configuración de permisos detallada
- 🔄 **Restauración Precisa**
  - Proceso automatizado de restauración
  - Verificación de integridad
  - Manejo de errores robusto

### 🛡️ Seguridad
- 🔒 **Sistema de Permisos Avanzado**
  - Control granular de accesos
  - Verificación de roles administrativos
  - Logs de auditoría detallados
- 🔐 **Protección de Datos**
  - Encriptación de información sensible
  - Backups seguros en base de datos
  - Cumplimiento con políticas de Discord

### ⚡ Nuevas Características

#### 🔄 Sistema de Backups Automáticos
- Configurable mediante `/backups`
- Intervalos personalizables:
  - 1 backup: 24h, 12h, 6h, 3h
  - 2 backups: 12h, 6h, 3h, 1h
  - 3 backups: 8h, 4h, 2h, 1h
  - 4 backups: 6h, 3h, 2h, 1h
- Notificaciones en canal designado
- Rotación automática de backups

#### 🌐 Sistema de Idiomas
- Soporte completo para Español e Inglés
- Cambio de idioma mediante comando `/language`
- Selector de idioma en el panel web
- Traducciones para todos los textos y mensajes

#### 💻 Panel Web Mejorado
- Gestión avanzada de permisos por rol
- Vista detallada de permisos por canal y categoría
- Edición y eliminación de backups desde la web
- Nuevas animaciones y efectos visuales
- Tooltips informativos
- Sistema de notificaciones mejorado
- Interfaz más intuitiva y responsive

## 🚀 Instalación

### Prerequisites

```bash
# Verifica la versión de Node.js (16.9.0+)
node --version

# Verifica la versión de MySQL (5.7+)
mysql --version

# Verifica npm
npm --version
```

### Paso a Paso

1. **Clona el Repositorio**
```bash
git clone https://github.com/Rexyto/discord-copy-bot.git
cd discord-copy-bot
```

2. **Instala las Dependencias**
```bash
# Instalación limpia
npm ci

# O instalación estándar
npm install
```

3. **Configura el Entorno**
```bash
# Crea el archivo de configuración
cp config.example.json config.json

# Edita el archivo con tus credenciales
nano config.json
```

4. **Estructura del `config.json`**
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

5. **Configura la Base de Datos**
```sql
-- Conecta a MySQL
mysql -u root -p

-- Crea la base de datos
CREATE DATABASE discord_copy_bot;

-- Crea el usuario (opcional)
CREATE USER 'copybot'@'localhost' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON discord_copy_bot.* TO 'copybot'@'localhost';
FLUSH PRIVILEGES;
```

6. **Despliega los Comandos**
```bash
node deploy-commands.js
```

7. **Inicia el Bot**
```bash
# Desarrollo
node .
```

## 💡 Uso

### 🛠️ Comandos Disponibles

| Comando | Descripción | Uso | Permisos |
|---------|-------------|-----|-----------|
| `/copy` | Crea una copia del servidor | `/copy nombre:MiBackup` | Admin |
| `/paste` | Restaura una copia | `/paste` | Admin |
| `/delete` | Elimina una copia | `/delete` | Admin |
| `/list` | Lista todas las copias | `/list` | Admin |
| `/info` | Muestra información de una copia | `/info nombre:MiBackup` | Admin |
| `/backups` | Configura backups automáticos | `/backups #canal cantidad:1-4` | Admin |
| `/web` | Abre el panel de control web | `/web` | Admin |
| `/language` | Cambia el idioma del bot | `/language` | Admin |
| `!back` | Muestra el último backup realizado | `!back` | Todos |
| `!stats` | Muestra estadísticas del servidor | `!stats` | Todos |
| `!help` | Muestra la ayuda del bot | `!help` | Todos |
| `!ping` | Comprueba la latencia del bot | `!ping` | Todos |

### 📝 Ejemplos de Uso

```bash
# Crear una copia
/copy nombre:Servidor-Principal

# Restaurar la última copia
/paste
> Selecciona "Servidor-Principal" del menú

# Ver copias disponibles
/list
```

### ⚙️ Configuración Avanzada

#### Personalización de Roles
```json
{
  "roleConfig": {
    "excludeRoles": ["@everyone", "Bots"],
    "preserveColors": true,
    "preserveHoist": true
  }
}
```

#### Configuración de Canales
```json
{
  "channelConfig": {
    "excludeCategories": ["Archivado"],
    "preservePermissions": true,
    "preserveTopics": true
  }
}
```

## 🔧 Mantenimiento

### 📊 Monitoreo
- Verifica los logs en `logs/bot.log`
- Monitorea el uso de la base de datos
- Revisa el estado del bot con `/status`

### 🔄 Actualizaciones
```bash
# Actualiza dependencias
npm update

# Verifica cambios
git pull origin main

# Reinicia el bot
pm2 restart discord-copy-bot
```

### 💾 Backups
```bash
# Backup de la base de datos
mysqldump -u root -p discord_copy_bot > backup.sql

# Restaurar backup
mysql -u root -p discord_copy_bot < backup.sql
```

## 🛡️ Seguridad

### 🔒 Mejores Prácticas
1. **Protección del Token**
   - Nunca compartas tu token
   - Usa variables de entorno
   - Rota el token regularmente

2. **Permisos de Base de Datos**
   - Usa usuarios con privilegios limitados
   - Implementa SSL para conexiones
   - Realiza backups regulares

3. **Seguridad del Servidor**
   - Mantén Node.js actualizado
   - Usa firewalls
   - Implementa rate limiting

## ❓ Preguntas Frecuentes

<details>
<summary><b>¿Cómo manejo errores comunes?</b></summary>

### 1. Error: Cannot find module 'discord.js'
```bash
npm install discord.js@14.14.1
```

### 2. Error: DiscordAPIError[50013]: Missing Permissions
- Verifica los permisos del bot
- Asegúrate de que el rol del bot esté arriba en la jerarquía

### 3. Error: Connection refused (MySQL)
- Verifica que MySQL esté corriendo
- Comprueba las credenciales
- Revisa el firewall
</details>

<details>
<summary><b>¿Cómo optimizo el rendimiento?</b></summary>

1. **Configuración de MySQL**
```ini
innodb_buffer_pool_size = 1G
max_connections = 100
query_cache_size = 256M
```

2. **Optimización de Node.js**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

3. **Caché y Rate Limiting**
- Implementa caché para comandos frecuentes
- Configura rate limits apropiados
- Usa índices en la base de datos
</details>

## 📚 Recursos Adicionales

### 📖 Documentación Relacionada
- [Discord.js Guide](https://discordjs.guide/)
- [Discord API Documentation](https://discord.com/developers/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### 🎓 Tutoriales
1. [Configuración Inicial](docs/setup.md)
2. [Gestión de Backups](docs/backups.md)
3. [Resolución de Problemas](docs/troubleshooting.md)

### 🔗 Enlaces Útiles
- [Discord Developers Portal](https://discord.com/developers/applications)
- [Node.js Downloads](https://nodejs.org/download/)
- [MySQL Community Downloads](https://dev.mysql.com/downloads/)

## 🤝 Contribuir

### 🌟 Cómo Contribuir
1. Fork el proyecto
2. Crea tu rama de características
   ```bash
   git checkout -b feature/NuevaCaracteristica
   ```
3. Commit tus cambios
   ```bash
   git commit -am 'Add: nueva característica'
   ```
4. Push a la rama
   ```bash
   git push origin feature/NuevaCaracteristica
   ```
5. Abre un Pull Request

### 📝 Guías de Contribución
- Sigue el estilo de código establecido
- Añade tests para nueva funcionalidad
- Actualiza la documentación
- Crea issues para cambios mayores

## 📫 Soporte y Contacto

### 🆘 Obtener Ayuda
- [GitHub Issues](https://github.com/Rexyto/discord-copy-bot/issues)


### 💬 Comunidad

- [Discussions](https://github.com/Rexyto/discord-copy-bot/discussions)

## 📜 Información Legal

### 📄 Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

### ⚖️ Términos de Uso
- Uso comercial permitido
- Modificación permitida
- Distribución permitida
- Uso privado permitido

### 🔒 Política de Privacidad
- No recolectamos datos personales
- Los backups son almacenados localmente
- Cumplimos con GDPR

## 🙏 Agradecimientos

### 👥 Contribuidores
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Rexyto">
        <img src="https://github.com/Rexyto.png" width="100px;" alt="Rexyto"/><br />
        <sub><b>Rexyto</b></sub>
      </a>
    </td>
    <!-- Añade más contribuidores aquí -->
  </tr>
</table>

### 🌟 Proyectos que nos Inspiran
- [Discord.js](https://discord.js.org)
- [Node.js](https://nodejs.org)
- [MySQL](https://www.mysql.com)

---

<div align="center">

**[🔝 Volver al inicio](#-discord-server-copy-bot)**

Hecho con ❤️ por [Rexyto](https://github.com/Rexyto)

</div>
