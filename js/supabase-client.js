// =====================================================================
// PROJETO PORLARES — CLIENTE SUPABASE E UTILITÁRIOS CENTRAIS
// =====================================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://tgfsmzvrvwyyqaglcjlk.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_T4GvtWNBKhscrkYIgetgxw_A9rUVLQ5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const DEMO_WHATSAPP = '5511987947960';

// ---------------------------------------------------------------------
// PRODUTOS DE DEMONSTRAÇÃO (Para visualização inicial caso o banco esteja vazio)
// ---------------------------------------------------------------------
export const DEMO_PRODUCTS = [
  {
    id: 'demo-sofa-1',
    name: 'Sofá Retrátil e Reclinável 3 Lugares Veludo Bege',
    description: 'Sofá retrátil e reclinável de 3 lugares, revestido em tecido veludo bege de toque suave. Estrutura em madeira maciça tratada, molas ensacadas e espuma D33. Em excelente estado de conservação.',
    price: 1890.00,
    category: 'Móveis',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 1,
    whatsapp: DEMO_WHATSAPP,
    status: 'active',
    is_demo: true
  },
  {
    id: 'demo-luminaria-2',
    name: 'Luminária Pendente Nórdica em Alumínio e Madeira',
    description: 'Luminária pendente de design escandinavo, acabamento preto fosco com detalhe nobre em madeira maciça. Soquete padrão E27, bivolt. Cabo ajustável de até 1,5 metro.',
    price: 249.90,
    category: 'Decoração',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 3,
    whatsapp: DEMO_WHATSAPP,
    status: 'active',
    is_demo: true
  },
  {
    id: 'demo-panelas-3',
    name: 'Jogo de Panelas Cerâmica Antiaderente 5 Peças',
    description: 'Conjunto completo de 5 panelas com revestimento cerâmico ecológico livre de PFOA e metais pesados. Cabos antitérmicos soft touch e tampas de vidro temperado com saída de vapor.',
    price: 420.00,
    category: 'Cozinha e utensílios',
    image_url: 'https://images.unsplash.com/photo-1584990347449-39726245367b?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584990347449-39726245367b?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 2,
    whatsapp: DEMO_WHATSAPP,
    status: 'active',
    is_demo: true
  },
  {
    id: 'demo-cafeteira-4',
    name: 'Cafeteira Espresso Automática 15 Bar',
    description: 'Cafeteira espresso compacta com pressão de 15 bar, sistema thermo-block de aquecimento rápido e bico vaporizador para leite. Acompanha filtros para pó e sachê.',
    price: 680.00,
    category: 'Eletrodomésticos',
    image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 1,
    whatsapp: DEMO_WHATSAPP,
    status: 'active',
    is_demo: true
  },
  {
    id: 'demo-mesa-5',
    name: 'Mesa de Cabeceira Industrial em Ferro e Madeira',
    description: 'Mesa de cabeceira com estrutura metálica em pintura eletrostática preta fosca e prateleiras em MDF tom carvalho natural. Ideal para organizar livros, luminária e acessórios.',
    price: 290.00,
    category: 'Quarto e cama',
    image_url: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 2,
    whatsapp: DEMO_WHATSAPP,
    status: 'active',
    is_demo: true
  },
  {
    id: 'demo-vaso-6',
    name: 'Vaso Decorativo Minimalista em Cerâmica Terracota',
    description: 'Peça artesanal de cerâmica com textura rústica e acabamento terracota fosco. Perfeito para arranjos florais secos, ramos de eucalipto ou decoração de mesas e estantes.',
    price: 135.00,
    category: 'Decoração',
    image_url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 4,
    whatsapp: DEMO_WHATSAPP,
    status: 'active',
    is_demo: true
  }
];

// ---------------------------------------------------------------------
// HELPERS DE FORMATAÇÃO
// ---------------------------------------------------------------------
export function formatCurrency(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function cleanPhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  // Se tiver 10 ou 11 dígitos (DDD + número brasileiro sem 55), adiciona 55
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  }
  return digits;
}

export function generateWhatsAppLink(phone, message = '') {
  const cleaned = cleanPhone(phone) || DEMO_WHATSAPP;
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

// ---------------------------------------------------------------------
// HELPERS DE AUTENTICAÇÃO E SESSÃO
// ---------------------------------------------------------------------
export async function getSessionUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session.user;
  } catch (err) {
    console.warn('Erro ao verificar sessão:', err);
    return null;
  }
}

export async function requireAuth(redirectUrl = 'login.html') {
  const user = await getSessionUser();
  if (!user) {
    const current = encodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
    window.location.href = `${redirectUrl}?redirect=${current}`;
    return null;
  }
  return user;
}

// ---------------------------------------------------------------------
// SISTEMA DE NOTIFICAÇÕES (TOAST)
// ---------------------------------------------------------------------
export function showToast(message, type = 'info', durationMs = 4000) {
  let container = document.getElementById('porlares-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'porlares-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Animação de entrada
  setTimeout(() => toast.classList.add('show'), 10);

  // Remover após duração
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, durationMs);
}

// ---------------------------------------------------------------------
// GERENCIADOR DO CARRINHO (LocalStorage: porlares_cart)
// ---------------------------------------------------------------------
const CART_KEY = 'porlares_cart';

export function getCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Erro ao ler carrinho:', e);
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadges();
  } catch (e) {
    console.error('Erro ao salvar carrinho:', e);
  }
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url || (product.images && product.images[0]) || 'https://via.placeholder.com/150',
      category: product.category || 'Geral',
      whatsapp: product.whatsapp || DEMO_WHATSAPP,
      seller_id: product.user_id || 'demo-seller',
      quantity: 1
    });
  }

  saveCart(cart);
  showToast(`"${product.name}" adicionado ao carrinho!`, 'success');
}

export function removeFromCart(index) {
  const cart = getCart();
  if (index >= 0 && index < cart.length) {
    const removed = cart.splice(index, 1)[0];
    saveCart(cart);
    showToast(`"${removed.name}" removido do carrinho.`, 'info');
  }
}

export function clearCart() {
  saveCart([]);
  showToast('Carrinho esvaziado com sucesso.', 'info');
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function updateCartBadges() {
  const count = getCartCount();
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  });
}
