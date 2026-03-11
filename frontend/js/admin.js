let allUsers = [];
let editingUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        document.getElementById('adminNameDisplay').textContent = `Admin: ${user.name}`;
    }

    fetchStats();
    fetchUsers();

    // Navigation
    document.getElementById('navUsers').addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('users');
    });
    
    document.getElementById('navLogs').addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('logs');
        fetchLogs();
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allUsers.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
        renderUsersTable(filtered);
    });

    // Modals
    document.getElementById('addUserBtn').addEventListener('click', () => {
        document.getElementById('addUserModal').classList.add('active');
    });

    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createUser();
    });

    document.getElementById('saveJsonBtn').addEventListener('click', saveJsonUser);
});

function switchTab(tab) {
    document.getElementById('navUsers').classList.remove('active');
    document.getElementById('navLogs').classList.remove('active');
    
    document.getElementById('usersView').style.display = 'none';
    document.getElementById('logsView').style.display = 'none';

    if (tab === 'users') {
        document.getElementById('navUsers').classList.add('active');
        document.getElementById('usersView').style.display = 'block';
    } else {
        document.getElementById('navLogs').classList.add('active');
        document.getElementById('logsView').style.display = 'block';
    }
}

async function fetchStats() {
    try {
        const res = await fetch(`${API_URL}/users/stats`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('statTotal').textContent = data.totalUsers;
            document.getElementById('statActive').textContent = data.activeUsers;
            document.getElementById('statAdmin').textContent = data.adminUsers;
        }
    } catch (error) {
        console.error('Failed to fetch stats:', error);
    }
}

async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        
        if (res.ok) {
            allUsers = data;
            renderUsersTable(allUsers);
        }
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        
        const perms = user.permissions || {};
        
        tr.innerHTML = `
            <td>
                <div style="font-weight: 500">${user.name}</div>
            </td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role === 'Admin' ? 'badge-admin' : 'badge-user'}">${user.role}</span></td>
            <td>
                <div class="checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" onchange="togglePermission('${user._id}', 'read')" ${perms.read ? 'checked' : ''}>
                        <span class="checkmark"></span> R
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" onchange="togglePermission('${user._id}', 'write')" ${perms.write ? 'checked' : ''}>
                        <span class="checkmark"></span> W
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" onchange="togglePermission('${user._id}', 'update')" ${perms.update ? 'checked' : ''}>
                        <span class="checkmark"></span> U
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" onchange="togglePermission('${user._id}', 'delete')" ${perms.delete ? 'checked' : ''}>
                        <span class="checkmark"></span> D
                    </label>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-icon" title="Edit JSON" onclick="openJsonModal('${user._id}')">
                        <i class="fa-solid fa-code"></i>
                    </button>
                    <button class="btn btn-icon" title="Delete User" style="color: var(--danger-color)" onclick="deleteUser('${user._id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function togglePermission(userId, perm) {
    const user = allUsers.find(u => u._id === userId);
    if (!user) return;

    user.permissions[perm] = !user.permissions[perm];

    try {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ permissions: user.permissions })
        });
        
        if (res.ok) {
            fetchStats(); // Update stats as active count might change
            // No need to re-render full table for checkboxes, visually immediate
        }
    } catch (error) {
        console.error('Failed to update permission:', error);
    }
}

async function createUser() {
    const errorDiv = document.getElementById('addError');
    errorDiv.style.display = 'none';

    const payload = {
        name: document.getElementById('addName').value,
        email: document.getElementById('addEmail').value,
        password: document.getElementById('addPassword').value,
        role: document.getElementById('addRole').value
    };

    try {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (res.ok) {
            closeModals();
            document.getElementById('addUserForm').reset();
            fetchUsers();
            fetchStats();
        } else {
            errorDiv.style.display = 'block';
            errorDiv.textContent = data.message || 'Failed to create user';
        }
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Network error';
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            fetchUsers();
            fetchStats();
        }
    } catch (error) {
        console.error('Failed to delete user:', error);
    }
}

function openJsonModal(id) {
    editingUserId = id;
    const user = allUsers.find(u => u._id === id);
    if (!user) return;

    const exportObj = {
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
    };

    document.getElementById('jsonEditorInput').value = JSON.stringify(exportObj, null, 2);
    document.getElementById('jsonError').style.display = 'none';
    document.getElementById('jsonModal').classList.add('active');
}

async function saveJsonUser() {
    if (!editingUserId) return;
    
    const input = document.getElementById('jsonEditorInput').value;
    const errorDiv = document.getElementById('jsonError');
    errorDiv.style.display = 'none';
    
    let parsedData;
    try {
        parsedData = JSON.parse(input);
    } catch (e) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Invalid JSON structure. Please verify.';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/users/${editingUserId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(parsedData)
        });

        if (res.ok) {
            closeModals();
            fetchUsers();
            fetchStats();
        } else {
            const data = await res.json();
            errorDiv.style.display = 'block';
            errorDiv.textContent = data.message || 'Error updating user';
        }
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Network error';
    }
}

function closeModals() {
    document.getElementById('addUserModal').classList.remove('active');
    document.getElementById('jsonModal').classList.remove('active');
}

async function fetchLogs() {
    try {
        const res = await fetch(`${API_URL}/users/logs`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        
        if (res.ok) {
            const tbody = document.getElementById('logsTableBody');
            tbody.innerHTML = '';
            
            data.forEach(log => {
                const tr = document.createElement('tr');
                const date = new Date(log.createdAt).toLocaleString();
                
                tr.innerHTML = `
                    <td>${date}</td>
                    <td><span class="badge badge-admin">${log.action}</span></td>
                    <td>${log.userId ? typeof log.userId === 'object' ? log.userId.email : log.userId : 'System'}</td>
                    <td>${log.details || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Failed to fetch logs:', error);
    }
}
