// =====================================================================
// PROJETO PORLARES — CATÁLOGO PRINCIPAL, BUSCA, FILTROS E MODAL
// =====================================================================
import { 
  supabase, 
  DEMO_PRODUCTS, 
  DEMO_WHATSAPP, 
  formatCurrency, 
  generateWhatsAppLink, 
  addToCart 
} from './supabase-client.js';

let allProducts = [];
let activeCategory = 'Todos';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
  setupSearch();
  setupCategoryPills();
  setupModalEvents();
  await loadCatalogProducts();
});

// ---------------------------------------------------------------------
// 1. CARREGAMENTO DOS PRODUTOS
// ---------------------------------------------------------------------
async function loadCatalogProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
      <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">Carregando anúncios do PorLares...</div>
      <small>Buscando os melhores produtos para você</small>
    </div>
  `;

  try {
    // Buscar produtos com status 'active' no Supabase
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao consultar Supabase (usando demonstração):', error.message);
      allProducts = DEMO_PRODUCTS;
    } else if (!products || products.length === 0) {
      // Se não houver produtos ativos cadastrados, exibe os produtos de demonstração
      allProducts = DEMO_PRODUCTS;
    } else {
      // Se tiver produtos no banco, buscar imagens complementares se a tabela existir
      allProducts = await enrichWithImages(products);
    }
  } catch (err) {
    console.error('Falha de conexão com o banco de dados:', err);
    allProducts = DEMO_PRODUCTS;
  }

  renderFilteredProducts();
}

// Busca imagens extras da tabela product_images se existir
async function enrichWithImages(products) {
  try {
    const productIds = products.map(p => p.id);
    const { data: images, error } = await supabase
      .from('product_images')
      .select('product_id, image_url')
      .in('product_id', productIds);

    if (!error && images) {
      const map = {};
      images.forEach(img => {
        if (!map[img.product_id]) map[img.product_id] = [];
        map[img.product_id].push(img.image_url);
      });

      return products.map(p => ({
        ...p,
        images: [p.image_url, ...(map[p.id] || [])].filter(Boolean)
      }));
    }
  } catch (e) {
    console.warn('Tabela product_images ainda não criada:', e.message);
  }

  return products.map(p => ({
    ...p,
    images: [p.image_url].filter(Boolean)
  }));
}

// ---------------------------------------------------------------------
// 2. RENDERIZAÇÃO E FILTRAGEM
// ---------------------------------------------------------------------
function renderFilteredProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (!grid) return;

  const filtered = allProducts.filter(p => {
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  if (countEl) {
    countEl.textContent = `${filtered.length} produto${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <i data-lucide="package-search" class="empty-state-icon"></i>
        <h3>Nenhum anúncio encontrado</h3>
        <p>Não encontramos produtos com os critérios de busca selecionados.</p>
        <button class="btn-card-details" onclick="window.clearFilters()" style="margin: 0 auto; display: inline-flex;">Limpar filtros</button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const safeName = escapeHtml(p.name);
    const safeDesc = escapeHtml(p.description || '');
    const safeCat = escapeHtml(p.category || 'Geral');
    const safeImg = p.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500';
    const isDemo = p.is_demo || !p.user_id;

    return `
      <div class="product-card">
        <div class="product-img-wrapper">
          <img src="${safeImg}" alt="${safeName}" class="product-img" loading="lazy">
          <span class="card-badge-top">${safeCat}</span>
          ${isDemo ? '<span class="card-badge-demo" title="Produto de exemplo">Demonstração</span>' : ''}
        </div>
        <div class="product-info">
          <span class="product-category-text">${safeCat}</span>
          <h3 class="product-name" title="${safeName}">${safeName}</h3>
          <p class="product-price">${formatCurrency(p.price)}</p>
          <div class="card-actions">
            <button class="btn-card-details" data-id="${p.id}" onclick="window.openProductModal('${p.id}')">
              <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
              <span>Ver mais</span>
            </button>
            <button class="btn-card-cart" onclick="window.handleAddToCart('${p.id}')">
              <i data-lucide="shopping-cart" style="width: 14px; height: 14px;"></i>
              <span>Carrinho</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// ---------------------------------------------------------------------
// 3. BARRA DE PESQUISA E CATEGORIAS
// ---------------------------------------------------------------------
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderFilteredProducts();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchQuery = searchInput.value;
        renderFilteredProducts();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchQuery = searchInput.value;
        renderFilteredProducts();
      }
    });
  }
}

function setupCategoryPills() {
  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category || 'Todos';
      renderFilteredProducts();
    });
  });
}

window.clearFilters = function() {
  activeCategory = 'Todos';
  searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(p => {
    p.classList.toggle('active', p.dataset.category === 'Todos');
  });
  renderFilteredProducts();
};

// ---------------------------------------------------------------------
// 4. MODAL DE DETALHES ("VER MAIS") COM GALERIA E WHATSAPP
// ---------------------------------------------------------------------
window.openProductModal = function(productId) {
  const product = allProducts.find(p => String(p.id) === String(productId));
  if (!product) return;

  const modal = document.getElementById('product-modal');
  if (!modal) return;

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500'];

  const mainImgEl = document.getElementById('modal-main-image');
  const thumbsContainer = document.getElementById('modal-thumbnails');
  const titleEl = document.getElementById('modal-title');
  const catEl = document.getElementById('modal-category');
  const priceEl = document.getElementById('modal-price');
  const descEl = document.getElementById('modal-description');
  const waBtn = document.getElementById('modal-whatsapp-btn');
  const addCartBtn = document.getElementById('modal-add-cart-btn');

  if (mainImgEl) mainImgEl.src = images[0];
  if (titleEl) titleEl.textContent = product.name;
  if (catEl) catEl.textContent = product.category || 'Geral';
  if (priceEl) priceEl.textContent = formatCurrency(product.price);
  if (descEl) descEl.textContent = product.description || 'Nenhuma descrição fornecida pelo vendedor.';

  // Configurar galeria de miniaturas
  if (thumbsContainer) {
    if (images.length > 1) {
      thumbsContainer.style.display = 'flex';
      thumbsContainer.innerHTML = images.map((img, idx) => `
        <div class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" onclick="window.switchModalImage('${img}', this)">
          <img src="${img}" alt="Foto ${idx + 1}">
        </div>
      `).join('');
    } else {
      thumbsContainer.style.display = 'none';
      thumbsContainer.innerHTML = '';
    }
  }

  // Configurar link do WhatsApp
  const phone = product.whatsapp || DEMO_WHATSAPP;
  const initialMsg = `Olá! Vi seu anúncio do produto "${product.name}" (${formatCurrency(product.price)}) no PorLares e tenho interesse em negociar!`;
  const waUrl = generateWhatsAppLink(phone, initialMsg);

  if (waBtn) {
    waBtn.href = waUrl;
    waBtn.setAttribute('target', '_blank');
    waBtn.setAttribute('rel', 'noopener noreferrer');
  }

  // Configurar botão de adicionar ao carrinho
  if (addCartBtn) {
    addCartBtn.onclick = () => {
      addToCart(product);
    };
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (window.lucide) window.lucide.createIcons();
};

window.switchModalImage = function(imgUrl, thumbElement) {
  const mainImgEl = document.getElementById('modal-main-image');
  if (mainImgEl) mainImgEl.src = imgUrl;

  const thumbs = document.querySelectorAll('.gallery-thumb-item');
  thumbs.forEach(t => t.classList.remove('active'));
  if (thumbElement) thumbElement.classList.add('active');
};

function setupModalEvents() {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function closeModal() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ---------------------------------------------------------------------
// 5. ADICIONAR AO CARRINHO GLOBAL
// ---------------------------------------------------------------------
window.handleAddToCart = function(productId) {
  const product = allProducts.find(p => String(p.id) === String(productId));
  if (product) {
    addToCart(product);
  }
};

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
