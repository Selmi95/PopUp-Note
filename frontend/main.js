const API_URL = '/api';

let currentUser = null;
let token = localStorage.getItem('token');
let editingNoteId = null;

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const notesView = document.getElementById('notes-view');
const adminView = document.getElementById('admin-view');
const alertContainer = document.getElementById('alert-container');
const userDisplay = document.getElementById('user-display');
const roleBadge = document.getElementById('role-badge');
const notesList = document.getElementById('notes-list');
const usersList = document.getElementById('users-list');
const noteCountEl = document.getElementById('note-count');
const noteModal = document.getElementById('note-modal');

const noteColors = ['note-yellow', 'note-green', 'note-blue', 'note-pink', 'note-orange'];
const noteRotations = [-6, 4, -3, 5, -2, 3, -4, 2];

document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            currentUser = userData;
            showApp();
        } else {
            showAuth();
        }
    } else {
        showAuth();
    }
});

function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    userDisplay.textContent = currentUser.email;
    roleBadge.textContent = currentUser.role.toUpperCase();
    roleBadge.className = `role-badge ${currentUser.role}`;

    if (currentUser.role === 'admin') {
        document.getElementById('btn-admin-view').classList.remove('hidden');
        showAdmin();
    } else {
        document.getElementById('btn-notes-view').classList.add('hidden');
        showNotes();
    }
}

function showNotes() {
    notesView.classList.remove('hidden');
    adminView.classList.add('hidden');
    document.getElementById('btn-notes-view').classList.add('hidden');
    if (currentUser.role === 'admin') {
        document.getElementById('btn-admin-view').classList.remove('hidden');
    }
    loadNotes();
}

function showAdmin() {
    notesView.classList.add('hidden');
    adminView.classList.remove('hidden');
    document.getElementById('btn-admin-view').classList.add('hidden');
    document.getElementById('btn-notes-view').classList.remove('hidden');
    loadUsers();
}

function showAlert(message, type = 'danger') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                logout();
            }
            throw new Error(data.error || data.message || Object.values(data)[0] || 'Request failed');
        }

        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

document.getElementById('btn-show-register').onclick = (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
};

document.getElementById('btn-show-login').onclick = (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
};

document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiRequest('/auth/login', 'POST', { email, password });
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        showApp();
    } catch (e) {}
};

document.getElementById('btn-register').onclick = async () => {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        await apiRequest('/auth/register', 'POST', { email, password });
        showAlert('Registration successful! Please login.', 'success');
        document.getElementById('btn-show-login').click();
    } catch (e) {}
};

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
}

document.getElementById('btn-logout').onclick = logout;

function getNoteStyle(index) {
    const colorIndex = index % noteColors.length;
    const rotationIndex = index % noteRotations.length;
    return {
        colorClass: noteColors[colorIndex],
        rotation: noteRotations[rotationIndex]
    };
}

async function loadNotes() {
    try {
        const notes = await apiRequest('/notes');
        notesList.innerHTML = '';

        const count = notes.length;
        if (count === 0) {
            noteCountEl.textContent = 'The wall is empty. Stick something up!';
        } else if (count === 1) {
            noteCountEl.textContent = 'You have 1 thought stuck on the wall.';
        } else {
            noteCountEl.textContent = `You have ${count} thoughts stuck on the wall.`;
        }

        notes.forEach((note, index) => {
            const { colorClass, rotation } = getNoteStyle(index);

            const div = document.createElement('div');
            div.className = `sticky-note ${colorClass}`;
            div.style.transform = `rotate(${rotation}deg)`;
            
            const clipDiv = document.createElement('div');
            clipDiv.className = 'note-clip';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'note-title';
            titleDiv.textContent = note.title;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'note-content';
            contentDiv.textContent = note.content;
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'note-date';
            dateDiv.textContent = new Date(note.createdAt).toLocaleDateString();
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'note-delete';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', async function(e) {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this note?')) {
                    try {
                        await apiRequest(`/notes/${note.id}`, 'DELETE');
                        loadNotes();
                    } catch (err) {
                        console.error('Delete note error:', err);
                    }
                }
            });
            
            div.appendChild(clipDiv);
            div.appendChild(titleDiv);
            div.appendChild(contentDiv);
            div.appendChild(dateDiv);
            div.appendChild(deleteBtn);
            
            div.addEventListener('click', function() {
                openEditModal(note);
            });
            
            notesList.appendChild(div);
        });
    } catch (e) {
        console.error('Load notes error:', e);
    }
}

document.getElementById('add-note-card').onclick = () => {
    editingNoteId = null;
    document.getElementById('modal-title').value = '';
    document.getElementById('modal-content').value = '';
    noteModal.classList.remove('hidden');
};

function openEditModal(note) {
    editingNoteId = note.id;
    document.getElementById('modal-title').value = note.title;
    document.getElementById('modal-content').value = note.content;
    noteModal.classList.remove('hidden');
}

function closeModal() {
    noteModal.classList.add('hidden');
    editingNoteId = null;
}

document.querySelector('.modal-overlay').onclick = closeModal;
document.querySelector('.modal-close').onclick = closeModal;

document.getElementById('btn-save-modal').onclick = async () => {
    const title = document.getElementById('modal-title').value;
    const content = document.getElementById('modal-content').value;

    if (!title.trim() || !content.trim()) {
        showAlert('Please fill in both title and content');
        return;
    }

    try {
        if (editingNoteId) {
            await apiRequest(`/notes/${editingNoteId}`, 'PUT', { title, content });
            showAlert('Note updated!', 'success');
        } else {
            await apiRequest('/notes', 'POST', { title, content });
            showAlert('Note saved!', 'success');
        }
        closeModal();
        loadNotes();
    } catch (e) {}
};

async function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        try {
            await apiRequest(`/notes/${id}`, 'DELETE');
            loadNotes();
        } catch (e) {}
    }
}

async function loadUsers() {
    try {
        const users = await apiRequest('/admin/users');
        usersList.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            
            const emailTd = document.createElement('td');
            emailTd.textContent = user.email;
            
            const roleTd = document.createElement('td');
            const roleSpan = document.createElement('span');
            roleSpan.className = `role-badge ${user.role}`;
            roleSpan.textContent = user.role.toUpperCase();
            roleTd.appendChild(roleSpan);
            
            const statusTd = document.createElement('td');
            const statusSpan = document.createElement('span');
            statusSpan.className = `status-badge ${user.status}`;
            statusSpan.textContent = user.status;
            statusTd.appendChild(statusSpan);
            
            const notesTd = document.createElement('td');
            notesTd.textContent = user.noteCount;
            
            const actionsTd = document.createElement('td');
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn-action btn-toggle';
            toggleBtn.textContent = user.status === 'active' ? 'Disable' : 'Enable';
            toggleBtn.addEventListener('click', async function() {
                try {
                    await apiRequest(`/admin/users/${user.id}/status`, 'PUT');
                    loadUsers();
                } catch (e) {
                    console.error('Toggle error:', e);
                }
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-action btn-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', async function() {
                if (confirm('Are you sure? This will delete the user and all their notes.')) {
                    try {
                        await apiRequest(`/admin/users/${user.id}`, 'DELETE');
                        loadUsers();
                    } catch (e) {
                        console.error('Delete error:', e);
                    }
                }
            });
            
            actionsTd.appendChild(toggleBtn);
            actionsTd.appendChild(deleteBtn);
            
            tr.appendChild(emailTd);
            tr.appendChild(roleTd);
            tr.appendChild(statusTd);
            tr.appendChild(notesTd);
            tr.appendChild(actionsTd);
            
            usersList.appendChild(tr);
        });
    } catch (e) {
        console.error('Load users error:', e);
    }
}

async function toggleUserStatus(id) {
    try {
        await apiRequest(`/admin/users/${id}/status`, 'PUT');
        loadUsers();
    } catch (e) {}
}

async function deleteUser(id) {
    if (confirm('Are you sure? This will delete the user and all their notes.')) {
        try {
            await apiRequest(`/admin/users/${id}`, 'DELETE');
            loadUsers();
        } catch (e) {}
    }
}

document.getElementById('btn-admin-view').onclick = showAdmin;
document.getElementById('btn-notes-view').onclick = showNotes;

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !noteModal.classList.contains('hidden')) {
        closeModal();
    }
});

window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
window.deleteNote = deleteNote;
