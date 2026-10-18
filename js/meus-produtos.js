// =====================================================================
// PROJETO PORLARES — GERENCIAMENTO DE MEUS PRODUTOS (ÁREA DO VENDEDOR)
// =====================================================================
import { 
  supabase, 
  requireAuth, 
  formatCurrency, 
  showToast 
} from './supabase-client.js';

let myProducts = [];
let currentFilter = 'all';
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  setupFilterTabs();
  await loadMyProducts();
});

// ---------------------------------------------------------------------
// 1. CARREGAMENTO DOS ANÚNCIOS DO USUÁRIO LOGADO
// ---------------------------------------------------------------------
async function loadMyProducts() {
  const container = document.getElementById('my-products-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 48px; color: var(--text-muted);">
      <div style="font-size: 1rem; font-weight: 600; margin-bottom: 6px;">Carregando seus anúncios...</div>
      <small>Buscando itens cadastrados no Supabase</small>
    </div>
  `;

  try {
    // Buscar produtos onde user_id corresponde ao usuário logado
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      // Caso a coluna user_id ainda não exista no banco (antes de rodar supabase_schema.sql)
      if (error.message?.includes('column') || error.code === '42703') {
        container.innerHTML = `
          <div class="empty-state">
            <i data-lucide="database" class="empty-state-icon"></i>
            <h3>Atualização de Banco Pendente</h3>
            <p>A coluna de relacionamento de usuário ainda não foi criada no banco de dados Supabase.</p>
            <p style="font-size: 0.8rem; color: #64748B;">Para habilitar a separação por usuário, execute o script <b>supabase_schema.sql</b> no painel do Supabase (SQL Editor).</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }
      throw error;
    }

    myProducts = data || [];
    updateStats();
    renderProductsList();

  } catch (err) {
    console.error('Erro ao carregar meus produtos:', err);
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="alert-triangle" class="empty-state-icon" style="color: var(--danger);"></i>
        <h3>Erro ao consultar seus anúncios</h3>
        <p>${err.message || 'Verifique sua conexão com o Supabase.'}</p>
        <button class="btn-card-details" onclick="location.reload()" style="margin: 0 auto; display: inline-flex;">Tentar Novamente</button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

// ---------------------------------------------------------------------
// 2. ATUALIZAÇÃO DAS ESTATÍSTICAS
// ---------------------------------------------------------------------
function updateStats() {
  const totalEl = document.getElementById('stat-total');
  const activeEl = document.getElementById('stat-active');
  const soldEl = document.getElementById('stat-sold');

  const total = myProducts.length;
  const active = myProducts.filter(p => p.status === 'active').length;
  const sold = myProducts.filter(p => p.status === 'sold').length;

  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (soldEl) soldEl.textContent = sold;
}

// ---------------------------------------------------------------------
// 3. RENDERIZAÇÃO DA LISTA
// ---------------------------------------------------------------------
function renderProductsList() {
  const container = document.getElementById('my-products-container');
  if (!container) return;

  const filtered = myProducts.filter(p => {
    if (currentFilter === 'active') return p.status === 'active';
    if (currentFilter === 'sold') return p.status === 'sold';
    return true;
  });

  if (filtered.length === 0) {
    const emptyMsg = currentFilter === 'sold'
      ? 'Você ainda não possui anúncios marcados como vendidos.'
      : currentFilter === 'active'
      ? 'Você não possui anúncios ativos no momento.'
      : 'Você ainda não publicou nenhum anúncio no PorLares.';

    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="package" class="empty-state-icon"></i>
        <h3>Nenhum anúncio nesta categoria</h3>
        <p>${emptyMsg}</p>
        <a href="produtos.html" class="btn-vender" style="display: inline-flex; margin: 0 auto;">Publicar meu primeiro anúncio</a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isSold = p.status === 'sold';
    const safeName = escapeHtml(p.name);
    const safeCat = escapeHtml(p.category || 'Geral');
    const safeImg = p.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500';
    const dateFormatted = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : 'Data não informada';

    return `
      <div class="my-product-row" id="product-row-${p.id}">
        <div class="my-product-main">
          <img src="${safeImg}" alt="${safeName}" class="my-product-thumb">
          <div class="my-product-details">
            <span class="product-category-text" style="font-size: 0.7rem;">${safeCat}</span>
            <h4>${safeName}</h4>
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 4px;">
              <span style="font-weight: 700; color: var(--brand-navy);">${formatCurrency(p.price)}</span>
              <span class="modal-status-badge ${isSold ? 'status-sold' : 'status-active'}">
                ${isSold ? 'Vendido' : 'Para Venda'}
              </span>
              <small style="color: var(--text-muted); font-size: 0.75rem;">Publicado em ${dateFormatted}</small>
            </div>
          </div>
        </div>

        <div class="my-product-actions">
          ${isSold ? `
            <button class="btn-toggle-status reactivate" onclick="window.toggleProductStatus('${p.id}', 'active')" title="Tornar disponível no catálogo público novamente">
              <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
              <span>Reativar (Para Venda)</span>
            </button>
          ` : `
            <button class="btn-toggle-status mark-sold" onclick="window.toggleProductStatus('${p.id}', 'sold')" title="Marcar como vendido e retirar da vitrine pública">
              <i data-lucide="check-check" style="width: 14px; height: 14px;"></i>
              <span>Marcar como Vendido</span>
            </button>
          `}
          
          <button class="btn-delete-product" onclick="window.deleteProduct('${p.id}', '${safeName.replace(/'/g, "\\'")}')" title="Excluir este anúncio permanentemente">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            <span>Excluir</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// ---------------------------------------------------------------------
// 4. ALTERNÂNCIA DE STATUS (PARA VENDA vs VENDIDO)
// ---------------------------------------------------------------------
window.toggleProductStatus = async function(productId, newStatus) {
  try {
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', productId)
      .eq('user_id', currentUser.id);

    if (error) throw error;

    // Atualizar no estado local
    const item = myProducts.find(p => p.id === productId);
    if (item) item.status = newStatus;

    updateStats();
    renderProductsList();

    if (newStatus === 'sold') {
      showToast('Produto marcado como Vendido! Ele foi retirado da vitrine pública.', 'info');
    } else {
      showToast('Produto reativado! Ele voltou a aparecer no catálogo público.', 'success');
    }
  } catch (err) {
    console.error('Erro ao atualizar status do produto:', err);
    showToast(`Erro ao alterar status: ${err.message}`, 'error');
  }
};

// ---------------------------------------------------------------------
// 5. EXCLUSÃO DE ANÚNCIO
// ---------------------------------------------------------------------
window.deleteProduct = async function(productId, productName) {
  const confirmed = confirm(`Tem certeza que deseja excluir permanentemente o anúncio "${productName}"? Esta ação não pode ser desfeita.`);
  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('user_id', currentUser.id);

    if (error) throw error;

    // Remover do array local
    myProducts = myProducts.filter(p => p.id !== productId);
    updateStats();
    renderProductsList();

    showToast(`Anúncio "${productName}" excluído com sucesso.`, 'info');
  } catch (err) {
    console.error('Erro ao excluir anúncio:', err);
    showToast(`Erro ao excluir: ${err.message}`, 'error');
  }
};

// ---------------------------------------------------------------------
// 6. FILTRO DE ABAS
// ---------------------------------------------------------------------
function setupFilterTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      renderProductsList();
    });
  });
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
