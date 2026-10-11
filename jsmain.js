const SUPABASE_URL = 'SUA_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_SUPABASE_ANON_KEY_AQUI';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  updateCartBadge();
});

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const { data: products, error } = await supabase.from('products').select('*');

  if (error || !products || products.length === 0) {
    grid.innerHTML = `
      <div class="product-card">
        <div>
          <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80" alt="Smartphone" class="product-img">
          <h3 class="product-name">Smartphone Pro X15</h3>
          <p class="product-price">R$ 2.499,90</p>
        </div>
        <button onclick="addToCartLocal('Smartphone Pro X15', 2499.90, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80')" class="btn-primary">Adicionar ao Carrinho</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div>
        <img src="${p.image_url}" alt="${p.name}" class="product-img">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-price">R$ ${p.price.toFixed(2)}</p>
      </div>
      <button onclick="addToCartLocal('${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.image_url}')" class="btn-primary">Adicionar ao Carrinho</button>
    </div>
  `).join('');
}

window.addToCartLocal = function(title, price, image) {
  let cart = JSON.parse(localStorage.getItem('pollaris_cart')) || [];
  const existing = cart.find(item => item.title === title);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ title, price, image, quantity: 1 });
  }
  localStorage.setItem('pollaris_cart', JSON.stringify(cart));
  updateCartBadge();
  alert(`"${title}" adicionado ao carrinho!`);
};

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('pollaris_cart')) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-counter-badge');
  if (badge) {
    if (total > 0) {
      badge.textContent = total;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}