// =====================================================================
// PROJETO PORLARES — AUTENTICAÇÃO REAL (SUPABASE AUTH)
// =====================================================================
import { supabase, showToast, getSessionUser, cleanPhone } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Se o usuário já estiver logado, redirecionar para a página principal
  const currentUser = await getSessionUser();
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get('redirect') || 'index.html';

  if (currentUser) {
    showToast(`Você já está conectado como ${currentUser.email}!`, 'info');
    setTimeout(() => {
      window.location.href = redirectTarget;
    }, 1200);
    return;
  }

  setupLoginForm(redirectTarget);
  setupRegisterForm(redirectTarget);
  setupPasswordToggles();
});

// ---------------------------------------------------------------------
// 1. FLUXO DE LOGIN
// ---------------------------------------------------------------------
function setupLoginForm(redirectTarget) {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  const submitBtn = loginForm.querySelector('button[type="submit"]');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorBox = document.getElementById('auth-error-box');

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      displayError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(submitBtn, true, 'Entrando...');
    clearError();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        handleAuthError(error);
        return;
      }

      if (data?.user) {
        showToast('Login realizado com sucesso! Bem-vindo de volta.', 'success');
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 800);
      }
    } catch (err) {
      console.error('Erro inesperado no login:', err);
      displayError('Ocorreu um erro inesperado ao tentar entrar. Tente novamente.');
    } finally {
      setLoading(submitBtn, false, 'Entrar na Conta');
    }
  });
}

// ---------------------------------------------------------------------
// 2. FLUXO DE CADASTRO
// ---------------------------------------------------------------------
function setupRegisterForm(redirectTarget) {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  const submitBtn = registerForm.querySelector('button[type="submit"]');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const phoneInput = document.getElementById('reg-phone');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!name || !email || !password) {
      displayError('Por favor, preencha nome, e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      displayError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(submitBtn, true, 'Criando sua conta...');
    clearError();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            whatsapp: cleanPhone(phone)
          }
        }
      });

      if (error) {
        handleAuthError(error);
        return;
      }

      // 1. Se a sessão for retornada diretamente, redireciona de imediato
      if (data?.session) {
        showToast('Conta criada com sucesso! Entrando...', 'success');
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 800);
        return;
      }

      // 2. Se não retornou sessão direta, tenta login imediato com a senha informada
      const loginAttempt = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginAttempt.data?.session) {
        showToast('Conta criada e autenticada com sucesso! Entrando...', 'success');
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 800);
        return;
      }

      // 3. Caso o Supabase ainda exija confirmação de e-mail por configuração do painel
      if (loginAttempt.error && loginAttempt.error.message.includes('Email not confirmed')) {
        displayError(`
          <strong>Conta criada! Porém a confirmação de e-mail ainda está ativa no painel do Supabase.</strong><br>
          Para liberar o acesso direto sem verificação:<br>
          1. No painel do Supabase, acesse <b>Authentication</b> &gt; <b>Providers</b> &gt; <b>Email</b>.<br>
          2. Desmarque a opção <b>Confirm email</b> e clique em <b>Save</b>.<br>
          3. Em seguida, basta clicar em <a href="login.html" style="color: inherit; font-weight: bold; text-decoration: underline;">Entrar na Conta</a>!
        `);
      }
    } catch (err) {
      console.error('Erro inesperado no cadastro:', err);
      displayError('Não foi possível concluir o cadastro. Verifique os dados informados.');
    } finally {
      setLoading(submitBtn, false, 'Criar Minha Conta');
    }
  });
}

// ---------------------------------------------------------------------
// TRATAMENTO DE ERROS AMIGÁVEL
// ---------------------------------------------------------------------
function handleAuthError(error) {
  console.warn('Supabase Auth error:', error);
  const msg = error.message || '';
  const code = error.code || '';

  if (msg.includes('Email logins are disabled') || msg.includes('Email signups are disabled') || code === 'email_provider_disabled') {
    displayError(`
      <strong>Atenção:</strong> O provedor de e-mail está desativado no Supabase.<br>
      Para ativar: acesse seu painel Supabase &gt; <b>Authentication</b> &gt; <b>Providers</b> &gt; <b>Email</b> e marque como <b>Enabled</b>.
    `);
    return;
  }

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) {
    displayError('E-mail ou senha incorretos. Por favor, verifique os dados digitados.');
    return;
  }

  if (msg.includes('User already registered') || msg.includes('already registered')) {
    displayError('Este e-mail já está cadastrado. <a href="login.html" style="color: inherit; text-decoration: underline; font-weight: bold;">Clique aqui para entrar</a>.');
    return;
  }

  if (msg.includes('Email not confirmed')) {
    displayError(`
      <strong>A confirmação de e-mail está ativada no seu painel Supabase.</strong><br>
      Para desativar e entrar direto: no painel do Supabase, vá em <b>Authentication</b> &gt; <b>Providers</b> &gt; <b>Email</b>, desmarque <b>Confirm email</b> e salve.<br>
      <i>Ou execute no SQL Editor: <code>UPDATE auth.users SET email_confirmed_at = now();</code></i>
    `);
    return;
  }

  if (msg.includes('Password should be at least')) {
    displayError('A senha é muito curta. Utilize pelo menos 6 caracteres.');
    return;
  }

  displayError(`Erro de autenticação: ${escapeHtml(msg)}`);
}

function displayError(htmlMessage) {
  const box = document.getElementById('auth-error-box');
  if (box) {
    box.className = 'alert-box alert-danger';
    box.innerHTML = htmlMessage;
    box.style.display = 'block';
  } else {
    showToast(htmlMessage.replace(/<[^>]+>/g, ''), 'error');
  }
}

function clearError() {
  const box = document.getElementById('auth-error-box');
  if (box) {
    box.style.display = 'none';
    box.innerHTML = '';
  }
}

function setLoading(button, isLoading, text) {
  if (!button) return;
  button.disabled = isLoading;
  button.style.opacity = isLoading ? '0.7' : '1';
  button.style.cursor = isLoading ? 'not-allowed' : 'pointer';
  button.textContent = text;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}

function setupPasswordToggles() {
  const toggles = [
    { btnId: 'toggle-login-password', inputId: 'login-password' },
    { btnId: 'toggle-reg-password', inputId: 'reg-password' }
  ];

  toggles.forEach(({ btnId, inputId }) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword 
        ? '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>' 
        : '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
      if (window.lucide) window.lucide.createIcons();
    });
  });
}

