document.addEventListener('DOMContentLoaded', () => {
    renderCart();
  });
  
  function renderCart() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    if (!container) return;
  
    let cart = JSON.parse(localStorage.getItem('pollaris_cart')) || [];
  
    if (cart.length === 0) {
      container.innerHTML = `<p class="text-sm text-slate-500 text-center py-8">Seu carrinho está vazio[cite: 1].</p>`;
      if (subtotalEl) subtotalEl.textContent = 'R$ 0,00';
      return;
    }
  
    let subtotal = 0;
    container.innerHTML = cart.map((item, idx) => {
      subtotal += item.price * item.quantity;
      return `
        <div class="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <img src="${item.image}" class="w-14 h-14 object-cover rounded-xl border">
            <div>
              <h4 class="font-semibold text-sm">${item.title}</h4>
              <p class="text-xs text-brand-teal font-bold">R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
          </div>
          <button onclick="removeItem(${idx})" class="text-xs text-red-500 hover:underline">Remover</button>
        </div>
      `;
    }).join('');
  
    if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
  }
  
  window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem('pollaris_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('pollaris_cart', JSON.stringify(cart));
    renderCart();
  };
  
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      alert('Pedido finalizado com sucesso!');
      localStorage.removeItem('pollaris_cart');
      window.location.href = 'index.html';
    });
  }