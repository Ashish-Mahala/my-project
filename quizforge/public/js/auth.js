// public/js/auth.js
// Unit III: JWT Authentication (Node.js Syllabus)
// Handles frontend auth state, login, register, logout

const Auth = (() => {
  let currentUser = JSON.parse(localStorage.getItem('qf_user') || 'null');

  const setUser = (user, token) => {
    currentUser = user;
    if (token) localStorage.setItem('qf_token', token);
    if (user)  localStorage.setItem('qf_user', JSON.stringify(user));
    updateNavUI();
  };

  const clearUser = () => {
    currentUser = null;
    localStorage.removeItem('qf_token');
    localStorage.removeItem('qf_user');
    updateNavUI();
  };

  const getUser = () => currentUser;

  const updateNavUI = () => {
    const navRight = document.getElementById('navRight');
    const navUser  = document.getElementById('navUser');
    const navUsername = document.getElementById('navUsername');
    if (currentUser) {
      navRight?.classList.add('hidden');
      navUser?.classList.remove('hidden');
      if (navUsername) navUsername.textContent = currentUser.username;
    } else {
      navRight?.classList.remove('hidden');
      navUser?.classList.add('hidden');
    }
  };

  return { setUser, clearUser, getUser, updateNavUI };
})();

// ── LOGIN ──
async function login() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) return toast('Fill in all fields', 'error');

  try {
    const data = await Api.post('/auth/login', { email, password });
    Auth.setUser(data.user, data.token);
    toast(`Welcome back, ${data.user.username}!`, 'success');
    showScreen('home');
  } catch (err) {
    toast(err.message, 'error');
  }
}

// ── REGISTER ──
async function register() {
  const username = document.getElementById('regUsername').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!username || !email || !password) return toast('Fill in all fields', 'error');
  if (password.length < 6) return toast('Password must be at least 6 characters', 'error');

  try {
    const data = await Api.post('/auth/register', { username, email, password });
    Auth.setUser(data.user, data.token);
    toast(`Account created! Welcome, ${data.user.username}!`, 'success');
    showScreen('home');
  } catch (err) {
    toast(err.message, 'error');
  }
}

// ── LOGOUT ──
function logout() {
  Auth.clearUser();
  toast('Logged out successfully', 'info');
  showScreen('home');
}
