document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        document.getElementById('userNameDisplay').textContent = `User: ${user.name}`;
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;

        // Render permissions
        const perms = user.permissions || { read: false, write: false, update: false, delete: false };

        const renderBadge = (elementId, hasPerm) => {
            const el = document.getElementById(elementId);
            if (hasPerm) {
                el.textContent = 'Active';
                el.classList.add('badge-success');
                el.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                el.style.color = '#10b981';
                el.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            } else {
                el.textContent = 'None';
                el.classList.add('badge-danger');
                el.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                el.style.color = '#ef4444';
                el.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            }
        };

        renderBadge('permRead', perms.read);
        renderBadge('permWrite', perms.write);
        renderBadge('permUpdate', perms.update);
        renderBadge('permDelete', perms.delete);
    }
});
