let currentBackup = null;
let currentLanguage = 'es';

document.addEventListener('DOMContentLoaded', () => {
    loadBackups();
    initializeStats();
    initializeLanguageSelector();
});

function initializeLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    selector.value = currentLanguage;
    
    selector.addEventListener('change', (e) => {
        updateLanguage(e.target.value);
        if (currentBackup) {
            showBackupDetails(currentBackup);
        }
    });
}

async function loadBackups() {
    try {
        const response = await fetch('/api/backups');
        const backups = await response.json();
        
        updateStats(backups);
        renderBackupsList(backups);
    } catch (error) {
        console.error('Error al cargar backups:', error);
        showError(getText('errorLoading'));
    }
}

function updateStats(backups) {
    const statsContent = document.getElementById('statsContent');
    const totalBackups = backups.length;
    const latestBackup = backups[0]?.created_at ? new Date(backups[0].created_at).toLocaleString() : 'N/A';
    
    statsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card animate-fade-in">
                <div class="flex items-center justify-between">
                    <h4 class="text-indigo-300 lang" data-key="totalBackups">Total Backups</h4>
                    <i class="fas fa-database text-indigo-400"></i>
                </div>
                <p class="text-3xl font-bold mt-2">${totalBackups}</p>
            </div>
            <div class="stat-card animate-fade-in" style="animation-delay: 0.2s">
                <div class="flex items-center justify-between">
                    <h4 class="text-indigo-300 lang" data-key="lastBackup">Último Backup</h4>
                    <i class="fas fa-clock text-indigo-400"></i>
                </div>
                <p class="text-sm mt-2">${latestBackup}</p>
            </div>
        </div>
    `;
    
    updateLanguage(currentLanguage);
}

function renderBackupsList(backups) {
    const backupsList = document.getElementById('backupsList');
    backupsList.innerHTML = '';

    backups.forEach((backup, index) => {
        const backupElement = createBackupElement(backup, index);
        backupsList.appendChild(backupElement);
    });
}

function createBackupElement(backup, index) {
    const div = document.createElement('div');
    div.className = 'backup-item p-4 rounded-lg cursor-pointer mb-4 animate-fade-in';
    div.style.animationDelay = `${index * 0.1}s`;
    
    const data = typeof backup.server_data === 'string' ? 
        JSON.parse(backup.server_data) : backup.server_data;
    
    const date = new Date(backup.created_at).toLocaleString();
    const totalChannels = data.categories.reduce((acc, cat) => acc + cat.channels.length, 0);
    
    div.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <h3 class="text-xl font-semibold text-indigo-300">
                    <i class="fas fa-save mr-2"></i>${backup.name}
                </h3>
                <p class="text-sm text-indigo-200 mt-1">
                    <i class="fas fa-clock mr-1"></i>${date}
                </p>
            </div>
            <div class="text-right">
                <p class="text-sm text-indigo-200">
                    <i class="fas fa-users mr-1"></i>${data.roles.length} <span class="lang" data-key="roles">roles</span>
                </p>
                <p class="text-sm text-indigo-200">
                    <i class="fas fa-folder mr-1"></i>${data.categories.length} <span class="lang" data-key="categories">categorías</span>
                </p>
                <p class="text-sm text-indigo-200">
                    <i class="fas fa-hashtag mr-1"></i>${totalChannels} <span class="lang" data-key="channels">canales</span>
                </p>
            </div>
        </div>
        <div class="flex justify-end mt-4 space-x-2">
            <button onclick="showRolePermissions('${backup.id}')" class="btn-secondary text-sm">
                <i class="fas fa-shield-alt mr-1"></i>
                <span class="lang" data-key="viewPermissions">Ver Permisos</span>
            </button>
            <button onclick="showEditBackupModal('${backup.id}')" class="btn-primary text-sm">
                <i class="fas fa-edit mr-1"></i>
                <span class="lang" data-key="editName">Editar Nombre</span>
            </button>
            <button onclick="showDeleteConfirmation('${backup.id}')" class="btn-danger text-sm">
                <i class="fas fa-trash mr-1"></i>
                <span class="lang" data-key="deleteBackup">Eliminar Backup</span>
            </button>
        </div>
    `;

    div.onclick = (e) => {
        if (!e.target.closest('button')) {
            showBackupDetails(backup);
        }
    };
    
    return div;
}

function showBackupDetails(backup) {
    currentBackup = backup;
    const detailsDiv = document.getElementById('backupDetails');
    const data = typeof backup.server_data === 'string' ? 
        JSON.parse(backup.server_data) : backup.server_data;

    detailsDiv.innerHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div class="server-structure animate-fade-in">
                <h3 class="text-xl font-semibold text-indigo-300 mb-4">
                    <i class="fas fa-sitemap mr-2"></i>Estructura
                </h3>
                ${createServerStructure(data)}
            </div>
            <div class="server-roles animate-fade-in" style="animation-delay: 0.2s">
                <h3 class="text-xl font-semibold text-indigo-300 mb-4">
                    <i class="fas fa-shield-alt mr-2"></i>Roles
                </h3>
                ${createRolesStructure(data)}
            </div>
        </div>
    `;

    initializeExpandableCategories();
    updateLanguage(currentLanguage);
}

function createServerStructure(data) {
    let html = '<div class="space-y-4">';
    
    data.categories.forEach(category => {
        html += `
            <div class="category-container bg-gray-700 rounded-lg p-2">
                <div class="category-header flex items-center justify-between cursor-pointer p-2 hover:bg-gray-600 rounded-lg">
                    <div class="flex items-center">
                        <i class="fas fa-folder mr-2 text-indigo-300"></i>
                        <span class="font-medium text-indigo-300">${category.name}</span>
                    </div>
                    <i class="fas fa-chevron-down text-indigo-300 transform transition-transform duration-200"></i>
                </div>
                <div class="channel-list mt-2 ml-6 hidden">
                    ${category.channels.map(channel => `
                        <div class="channel-item flex items-center p-2 hover:bg-gray-600 rounded-lg group">
                            <i class="fas fa-hashtag mr-2 text-indigo-300"></i>
                            <span class="text-indigo-200">${channel.name}</span>
                            <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="showChannelPermissions('${channel.name}')" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded">
                                    <i class="fas fa-lock mr-1"></i>Permisos
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    return html + '</div>';
}

function createRolesStructure(data) {
    return `
        <div class="space-y-2">
            ${data.roles.map(role => `
                <div class="role-item flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                     style="border-left: 4px solid #${role.color.toString(16).padStart(6, '0')}">
                    <div class="flex items-center">
                        <span class="text-indigo-200">${role.name}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs text-indigo-300">${formatPermissions(BigInt(role.permissions))}</span>
                        <button onclick="showRolePermissions('${role.id}')" 
                                class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded">
                            <i class="fas fa-shield-alt mr-1"></i>Permisos
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function initializeExpandableCategories() {
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const channelList = header.nextElementSibling;
            const icon = header.querySelector('.fas.fa-chevron-down');
            
            channelList.classList.toggle('hidden');
            icon.style.transform = channelList.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    });
}

function showRolePermissions(roleId) {
    if (!currentBackup) return;
    
    const modal = document.getElementById('rolePermissionsModal');
    const content = document.getElementById('rolePermissionsContent');
    const data = typeof currentBackup.server_data === 'string' ? 
        JSON.parse(currentBackup.server_data) : currentBackup.server_data;
    
    const role = data.roles.find(r => r.id === roleId);
    if (!role) return;

    content.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-indigo-300">
                    ${role.name}
                </h3>
                <div class="role-badge px-2 py-1 rounded"
                     style="background-color: #${role.color.toString(16).padStart(6, '0')}1A;
                            border: 1px solid #${role.color.toString(16).padStart(6, '0')}">
                </div>
            </div>
            ${createPermissionToggles(role.permissions)}
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function showChannelPermissions(channelName) {
    if (!currentBackup) return;
    
    const modal = document.getElementById('rolePermissionsModal');
    const content = document.getElementById('rolePermissionsContent');
    
    content.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-indigo-300">
                    #${channelName}
                </h3>
            </div>
            <div class="bg-gray-700 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-indigo-300 mb-2">Permisos del Canal</h4>
                <!-- Aquí irían los permisos específicos del canal -->
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function showEditBackupModal(backupId) {
    const backup = currentBackup;
    if (!backup) return;

    const modal = document.getElementById('editBackupModal');
    const input = document.getElementById('editBackupName');
    
    input.value = backup.name;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function showDeleteConfirmation(backupId) {
    const modal = document.getElementById('deleteConfirmModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

function createPermissionToggles(permissions) {
    const permissionsList = [
        { name: 'Administrator', bit: 0x8n },
        { name: 'View Channels', bit: 0x400n },
        { name: 'Send Messages', bit: 0x800n },
        { name: 'Manage Channels', bit: 0x4000n },
        { name: 'Manage Roles', bit: 0x10000000n },
        { name: 'Manage Server', bit: 0x20n },
        { name: 'Kick Members', bit: 0x2n },
        { name: 'Ban Members', bit: 0x4n }
    ];

    return `
        <div class="grid grid-cols-2 gap-4">
            ${permissionsList.map(perm => `
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                    <span class="text-indigo-200">${perm.name}</span>
                    <button class="permission-toggle ${BigInt(permissions) & perm.bit ? 'bg-indigo-600' : 'bg-gray-400'}" 
                            aria-checked="${Boolean(BigInt(permissions) & perm.bit)}"
                            onclick="togglePermission(this)">
                        <span class="permission-toggle-handle"></span>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function togglePermission(button) {
    const checked = button.getAttribute('aria-checked') === 'true';
    button.setAttribute('aria-checked', (!checked).toString());
    button.classList.toggle('bg-indigo-600');
    button.classList.toggle('bg-gray-400');
}

async function savePermissions() {
    try {
        // Implementar la lógica para guardar los permisos
        showNotification(getText('permissionsSaved'), 'success');
        closeModal('rolePermissionsModal');
        await loadBackups(); // Recargar la lista para mostrar los cambios
    } catch (error) {
        console.error('Error al guardar permisos:', error);
        showNotification(getText('error'), 'error');
    }
}

async function saveBackupChanges() {
    try {
        const newName = document.getElementById('editBackupName').value;
        if (!newName.trim()) {
            showNotification(getText('error'), 'error');
            return;
        }
        
        // Implementar la lógica para guardar los cambios
        showNotification(getText('backupUpdated'), 'success');
        closeModal('editBackupModal');
        await loadBackups(); // Recargar la lista para mostrar los cambios
    } catch (error) {
        console.error('Error al actualizar backup:', error);
        showNotification(getText('error'), 'error');
    }
}

async function confirmDelete() {
    try {
        // Implementar la lógica para eliminar el backup
        showNotification(getText('backupDeleted'), 'success');
        closeModal('deleteConfirmModal');
        await loadBackups(); // Recargar la lista para mostrar los cambios
    } catch (error) {
        console.error('Error al eliminar backup:', error);
        showNotification(getText('error'), 'error');
    }
}

function formatPermissions(bitfield) {
    const permissions = [];
    if (bitfield & 0x8n) permissions.push('Admin');
    if (bitfield & 0x400n) permissions.push('View');
    if (bitfield & 0x800n) permissions.push('Send');
    if (bitfield & 0x4000n) permissions.push('Manage');
    return permissions.join(', ');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } animate-fade-in z-50`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'} mr-2"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    const backupsList = document.getElementById('backupsList');
    backupsList.innerHTML = `
        <div class="text-red-400 p-4 text-center bg-red-900 bg-opacity-20 rounded-lg animate-fade-in">
            <i class="fas fa-exclamation-triangle mr-2"></i>${message}
        </div>
    `;
}