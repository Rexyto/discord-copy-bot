const translations = {
    es: {
        statistics: "Estadísticas",
        availableBackups: "Backups Disponibles",
        backupDetails: "Detalles del Backup",
        selectBackup: "Selecciona un backup para ver sus detalles",
        rolePermissions: "Permisos del Rol",
        editBackup: "Editar Backup",
        backupName: "Nombre del Backup",
        cancel: "Cancelar",
        saveChanges: "Guardar Cambios",
        confirmDelete: "Confirmar Eliminación",
        deleteConfirmMessage: "¿Estás seguro de que quieres eliminar este backup? Esta acción no se puede deshacer.",
        delete: "Eliminar",
        totalBackups: "Total de Backups",
        lastBackup: "Último Backup",
        roles: "roles",
        categories: "categorías",
        channels: "canales",
        loading: "Cargando...",
        error: "Error",
        success: "Éxito",
        permissionsSaved: "Permisos guardados correctamente",
        backupDeleted: "Backup eliminado correctamente",
        backupUpdated: "Backup actualizado correctamente",
        errorLoading: "Error al cargar los datos",
        viewPermissions: "Ver Permisos",
        editName: "Editar Nombre",
        deleteBackup: "Eliminar Backup",
        created: "Creado",
        channelPermissions: "Permisos del Canal",
        categoryPermissions: "Permisos de la Categoría"
    },
    en: {
        statistics: "Statistics",
        availableBackups: "Available Backups",
        backupDetails: "Backup Details",
        selectBackup: "Select a backup to view its details",
        rolePermissions: "Role Permissions",
        editBackup: "Edit Backup",
        backupName: "Backup Name",
        cancel: "Cancel",
        saveChanges: "Save Changes",
        confirmDelete: "Confirm Deletion",
        deleteConfirmMessage: "Are you sure you want to delete this backup? This action cannot be undone.",
        delete: "Delete",
        totalBackups: "Total Backups",
        lastBackup: "Last Backup",
        roles: "roles",
        categories: "categories",
        channels: "channels",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        permissionsSaved: "Permissions saved successfully",
        backupDeleted: "Backup deleted successfully",
        backupUpdated: "Backup updated successfully",
        errorLoading: "Error loading data",
        viewPermissions: "View Permissions",
        editName: "Edit Name",
        deleteBackup: "Delete Backup",
        created: "Created",
        channelPermissions: "Channel Permissions",
        categoryPermissions: "Category Permissions"
    }
};

let currentLanguage = 'es';

function updateLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang').forEach(element => {
        const key = element.getAttribute('data-key');
        if (key && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

function getText(key) {
    return translations[currentLanguage][key] || key;
}