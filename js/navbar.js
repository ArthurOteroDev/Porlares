// =====================================================================
// PROJETO PORLARES — COMPONENTE DE CABEÇALHO / NAVBAR GLOBAL
// =====================================================================
import { supabase, getSessionUser, updateCartBadges, showToast } from './supabase-client.js';

export async function initNavbar() {
  updateCartBadges();

  const userActionContainer = document.getElementById('user-nav-actions');
  const user = await getSessionUser();

  if (userActionContainer) {
    if (user) {
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Minha Conta';
      userActionContainer.innerHTML = `
        <a href="meus-produtos.html" class="nav-link" title="Gerenciar meus anúncios">
          <i data-lucide="package" style="width: 16px; height: 16px;"></i>
          <span>Meus Produtos</span>
        </a>
        <div class="user-dropdown">
          <button class="nav-link user-profile-btn" id="btn-user-menu">
            <i data-lucide="user-check" style="width: 16px; height: 16px; color: var(--brand-teal);"></i>
            <span class="user-name-text">${escapeHtml(displayName)}</span>
            <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
          </button>
          <div class="dropdown-menu" id="user-dropdown-menu">
            <div class="dropdown-header">
              <strong>${escapeHtml(displayName)}</strong>
              <small>${escapeHtml(user.email || '')}</small>
            </div>
            <a href="meus-produtos.html" class="dropdown-item">
              <i data-lucide="tag" style="width: 14px; height: 14px;"></i>
              <span>Meus Anúncios</span>
            </a>
            <a href="produtos.html" class="dropdown-item">
              <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i>
              <span>Anunciar Novo</span>
            </a>
            <hr class="dropdown-divider">
            <button class="dropdown-item logout-btn" id="btn-logout">
              <i data-lucide="log-out" style="width: 14px; height: 14px; color: #ef4444;"></i>
              <span style="color: #ef4444;">Sair da Conta</span>
            </button>
          </div>
        </div>
      `;

      // Evento para abrir dropdown
      const btnMenu = document.getElementById('btn-user-menu');
      const dropdown = document.getElementById('user-dropdown-menu');
      if (btnMenu && dropdown) {
        btnMenu.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('active');
        });
        document.addEventListener('click', () => dropdown.classList.remove('active'));
      }

      // Evento de Logout
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
          try {
            await supabase.auth.signOut();
            showToast('Você saiu da sua conta.', 'info');
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 500);
          } catch (e) {
            console.error('Erro ao sair:', e);
            window.location.reload();
          }
        });
      }
    } else {
      userActionContainer.innerHTML = `
        <a href="login.html" class="nav-link">
          <i data-lucide="user" style="width: 16px; height: 16px;"></i>
          <span>Entrar</span>
        </a>
      `;
    }
  }

  // Renderizar ícones Lucide
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', initNavbar);
