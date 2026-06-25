const tabs = document.querySelectorAll('.tabs button');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const securePage = document.getElementById('securePage');
const message = document.getElementById('message');
const welcome = document.getElementById('welcome');
const logoutBtn = document.getElementById('logoutBtn');

let users = JSON.parse(localStorage.getItem('oibsipUsers') || '[]');
let currentUser = JSON.parse(localStorage.getItem('oibsipSession') || 'null');

function createId(){
    return crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveUsers(){
    localStorage.setItem('oibsipUsers', JSON.stringify(users));
}

function showSecure(user){
    currentUser = user;
    localStorage.setItem('oibsipSession', JSON.stringify(user));
    securePage.classList.remove('hidden');
    welcome.textContent = `Welcome, ${user.name}. This page is visible only after login.`;
}

function validateEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

tabs.forEach(tab => tab.addEventListener('click', function(){
    tabs.forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    message.textContent = '';
    loginForm.classList.toggle('hidden', tab.dataset.tab !== 'login');
    registerForm.classList.toggle('hidden', tab.dataset.tab !== 'register');
}));

registerForm.addEventListener('submit', function(event){
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    message.textContent = '';

    if(!name || !validateEmail(email) || password.length < 6){
        message.textContent = 'Enter name, valid email and 6+ character password.';
        return;
    }

    if(users.some(user => user.email === email)){
        message.textContent = 'Account already exists. Please login.';
        return;
    }

    const user = { id:createId(), name, email, password };
    users.push(user);
    saveUsers();
    registerForm.reset();
    showSecure({ id:user.id, name:user.name, email:user.email });
});

loginForm.addEventListener('submit', function(event){
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const user = users.find(item => item.email === email && item.password === password);
    message.textContent = '';

    if(!user){
        message.textContent = 'Invalid email or password.';
        return;
    }

    loginForm.reset();
    showSecure({ id:user.id, name:user.name, email:user.email });
});

logoutBtn.addEventListener('click', function(){
    localStorage.removeItem('oibsipSession');
    currentUser = null;
    securePage.classList.add('hidden');
    message.textContent = 'Logged out successfully.';
});

if(currentUser){
    showSecure(currentUser);
}
