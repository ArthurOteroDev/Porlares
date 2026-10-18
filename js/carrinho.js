// =====================================================================
// PROJETO PORLARES — CARRINHO AGRUPADO POR VENDEDOR & WHATSAPP
// =====================================================================
import { 
  getCart, 
  saveCart, 
  clearCart, 
  formatCurrency, 
  generateWhatsAppLink, 
  DEMO_WHATSAPP, 
  showToast,
  updateCartBadges
} from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  setupClearCartButton();
});

// ---------------------------------------------------------------------
// 1. RENDERIZAÇÃO DO CARRINHO COM AGRUPAMENTO POR VENDEDOR
// ---------------------------------------------------------------------
export function renderCart() {
  const container = document.getElementById('cart-groups-container');
  const summaryItems = document.getElementById('summary-total-items');
  const summarySellers = document.getElementById('summary-total-sellers');
  const summaryTotal = document.getElementById('summary-total-price');
  const cartSummaryBox = document.getElementById('cart-summary-box');

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="shopping-bag" class="empty-state-icon"></i>
        <h3>Seu carrinho está vazio</h3>
        <p>Você ainda não adicionou nenhum item. Explore o catálogo para encontrar ofertas incríveis para seu lar!</p>
        <a href="index.html" class="btn-vender" style="display: inline-flex; margin: 0 auto;">Ver Produtos no Catálogo</a>
      </div>
    `;

    if (summaryItems) summaryItems.textContent = '0';
    if (summarySellers) summarySellers.textContent = '0';
    if (summaryTotal) summaryTotal.textContent = 'R$ 0,00';
    if (cartSummaryBox) cartSummaryBox.style.opacity = '0.6';

    updateCartBadges();
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  if (cartSummaryBox) cartSummaryBox.style.opacity = '1';

  // Agrupar produtos por vendedor (usando o WhatsApp do anúncio como chave única do vendedor)
  const groupsMap = {};

  cart.forEach((item, originalIndex) => {
    const sellerKey = item.whatsapp || item.seller_id || DEMO_WHATSAPP;
    if (!groupsMap[sellerKey]) {
      groupsMap[sellerKey] = {
        sellerKey,
        sellerWhatsapp: item.whatsapp || DEMO_WHATSAPP,
        sellerName: formatSellerLabel(item.whatsapp || DEMO_WHATSAPP),
        items: [],
        subtotal: 0
      };
    }

    const itemTotal = (item.price || 0) * (item.quantity || 1);
    groupsMap[sellerKey].items.push({ ...item, originalIndex, itemTotal });
    groupsMap[sellerKey].subtotal += itemTotal;
  });

  const sellerGroups = Object.values(groupsMap);

  // Totais Gerais
  const grandTotal = sellerGroups.reduce((acc, g) => acc + g.subtotal, 0);
  const totalItemCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  if (summaryItems) summaryItems.textContent = `${totalItemCount} item(s)`;
  if (summarySellers) summarySellers.textContent = `${sellerGroups.length} vendedor(es)`;
  if (summaryTotal) summaryTotal.textContent = formatCurrency(grandTotal);

  // Renderizar cada grupo de vendedor
  container.innerHTML = sellerGroups.map((group, groupIndex) => {
    const safeWhatsapp = escapeHtml(group.sellerWhatsapp);
    const safeSellerName = escapeHtml(group.sellerName);

    return `
      <div class="seller-group-card" id="seller-group-${groupIndex}">
        <!-- Cabeçalho do Vendedor -->
        <div class="seller-header">
          <div class="seller-title-box">
            <div class="seller-badge-icon">
              <i data-lucide="store" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div class="seller-name">${safeSellerName}</div>
              <div class="seller-phone-tag">Contato: ${formatPhoneDisplay(group.sellerWhatsapp)}</div>
            </div>
          </div>
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--brand-teal);">
            ${group.items.length} produto(s) deste vendedor
          </span>
        </div>

        <!-- Lista de Itens do Vendedor -->
        <div class="cart-items-list">
          ${group.items.map(item => `
            <div class="cart-item-row">
              <div class="cart-item-left">
                <img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-item-img">
                <div class="cart-item-info">
                  <h4>${escapeHtml(item.name)}</h4>
                  <span class="cart-item-category">${escapeHtml(item.category || 'Geral')}</span>
                  <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                    Quantidade: <b>${item.quantity || 1}</b>
                  </div>
                </div>
              </div>

              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                <div class="cart-item-price">${formatCurrency(item.itemTotal)}</div>
                ${item.quantity > 1 ? `<small style="font-size: 0.72rem; color: var(--text-muted);">(${formatCurrency(item.price)} cada)</small>` : ''}
                <button class="cart-item-remove-btn" onclick="window.removeCartItem(${item.originalIndex})" title="Remover item">
                  <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
                  <span>Remover</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Rodapé do Grupo do Vendedor -->
        <div class="seller-footer">
          <div class="seller-subtotal-box">
            Subtotal do Vendedor: <strong>${formatCurrency(group.subtotal)}</strong>
          </div>
          <button class="btn-contact-seller-group" onclick="window.contactSellerGroup('${group.sellerWhatsapp}')">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.761.884 2.79.885h.002c3.18 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.769-5.771zm3.376 8.204c-.149.42-.871.782-1.205.832-.335.05-.77.067-1.246-.086-.307-.099-.705-.24-1.218-.466-2.164-.954-3.575-3.176-3.683-3.322-.109-.146-.879-1.168-.879-2.228 0-1.06.554-1.58.751-1.796.197-.215.429-.269.573-.269.144 0 .287.002.412.008.132.007.309-.05.483.37.18.435.614 1.498.668 1.606.054.108.09.234.018.378-.072.144-.108.234-.216.36-.108.126-.228.281-.326.377-.108.108-.22.226-.095.442.126.216.558.921 1.198 1.491.824.733 1.52.96 1.736 1.068.216.108.342.09.469-.054.126-.144.538-.629.682-.845.144-.216.287-.18.483-.108.197.072 1.25.59 1.466.698.216.108.36.162.413.252.054.09.054.523-.095.943z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.66 1.443 5.176L2 22l4.981-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.636 0-3.15-.494-4.417-1.341l-.316-.214-2.964.831.844-2.905-.236-.339A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2s8.2 3.679 8.2 8.2-3.679 8.2-8.2 8.2z"/>
            </svg>
            <span>Negociar Grupo no WhatsApp</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  updateCartBadges();
  if (window.lucide) window.lucide.createIcons();
}

// ---------------------------------------------------------------------
// 2. CONTATO COM O VENDEDOR VIA WHATSAPP (COM REMOÇÃO SELETIVA)
// ---------------------------------------------------------------------
window.contactSellerGroup = function(sellerWhatsapp) {
  const cart = getCart();

  // Filtrar itens que pertencem a esse vendedor
  const sellerItems = cart.filter(item => (item.whatsapp || DEMO_WHATSAPP) === sellerWhatsapp);

  if (sellerItems.length === 0) return;

  // Montar mensagem detalhada com todos os produtos do grupo
  let messageLines = [
    'Olá! Tenho interesse em adquirir os seguintes produtos anunciados por você no PorLares:',
    ''
  ];

  let subtotal = 0;
  sellerItems.forEach((item, i) => {
    const qty = item.quantity || 1;
    const itemTotal = item.price * qty;
    subtotal += itemTotal;
    messageLines.push(`• ${qty}x ${item.name} — ${formatCurrency(itemTotal)}`);
  });

  messageLines.push('');
  messageLines.push(`Subtotal da seleção: ${formatCurrency(subtotal)}`);
  messageLines.push('Como podemos combinar o pagamento e a entrega/retirada?');

  const fullMessage = messageLines.join('\n');
  const waUrl = generateWhatsAppLink(sellerWhatsapp, fullMessage);

  // Abrir conversa no WhatsApp em nova aba
  window.open(waUrl, '_blank', 'noopener,noreferrer');

  // REGRA DO REQUISITO:
  // "Remova do carrinho somente os produtos daquele vendedor que foram encaminhados para contato. Preserve os produtos dos demais vendedores."
  const remainingCart = cart.filter(item => (item.whatsapp || DEMO_WHATSAPP) !== sellerWhatsapp);
  saveCart(remainingCart);

  showToast('Itens encaminhados ao WhatsApp! Eles foram removidos do carrinho.', 'success', 5000);

  // Re-renderizar o carrinho imediatamente
  renderCart();
};

// ---------------------------------------------------------------------
// 3. REMOÇÃO INDIVIDUAL
// ---------------------------------------------------------------------
window.removeCartItem = function(index) {
  const cart = getCart();
  if (index >= 0 && index < cart.length) {
    const removed = cart.splice(index, 1)[0];
    saveCart(cart);
    showToast(`"${removed.name}" removido do carrinho.`, 'info');
    renderCart();
  }
};

// ---------------------------------------------------------------------
// 4. ESVAZIAR CARRINHO COMPLETO
// ---------------------------------------------------------------------
function setupClearCartButton() {
  const btnClear = document.getElementById('btn-clear-cart');
  if (!btnClear) return;

  btnClear.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) {
      showToast('Seu carrinho já está vazio.', 'info');
      return;
    }

    const confirmed = confirm('Tem certeza que deseja remover todos os itens do seu carrinho?');
    if (confirmed) {
      clearCart();
      renderCart();
    }
  });
}

// ---------------------------------------------------------------------
// HELPERS DE FORMATAÇÃO
// ---------------------------------------------------------------------
function formatSellerLabel(phone) {
  if (phone === DEMO_WHATSAPP) return 'Vendedor PorLares (Demonstração)';
  return `Vendedor Loja (${formatPhoneDisplay(phone)})`;
}

function formatPhoneDisplay(phone) {
  if (!phone) return 'Não informado';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 13) {
    // 55 11 99999-9999
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
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