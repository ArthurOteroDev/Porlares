// Configuração do Supabase via Objeto Global
const SUPABASE_URL = 'SUA_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_SUPABASE_ANON_KEY_AQUI';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Lógica de Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert('Erro ao entrar: Credenciais incorretas ou utilizador não registado.');
    } else {
      alert('Login efetuado com sucesso!');
      window.location.href = 'index.html';
    }
  });
}

// Lógica de Cadastro
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) {
      alert('Erro no cadastro: ' + error.message);
    } else {
      alert('Cadastro realizado com sucesso! Bem-vindo ao POLLARIS.');
      window.location.href = 'index.html';
    }
  });
}