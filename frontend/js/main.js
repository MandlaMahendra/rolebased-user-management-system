const API_URL = 'https://rolebased-user-management-system.onrender.com/api';

// Check auth state on load
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');

    // Auto redirect if logged in
    if (userStr && window.location.pathname.endsWith('index.html') || userStr && window.location.pathname === '/') {
        const user = JSON.parse(userStr);
        if (user.role === 'Admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }

    // Protection for dashboard routes
    if (!userStr && (window.location.pathname.includes('dashboard.html'))) {
        window.location.href = 'index.html';
    }
});

// Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data));

                if (data.role === 'Admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            } else {
                errorDiv.style.display = 'block';
                errorDiv.textContent = data.message || 'Login failed';
            }
        } catch (error) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Network error. Please try again.';
            console.error(error);
        }
    });
}

// Common function to get auth headers
function getAuthHeaders() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};

    const user = JSON.parse(userStr);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
    };
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
