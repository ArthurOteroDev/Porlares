const SUPABASE_URL = 'SUA_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_SUPABASE_ANON_KEY_AQUI';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('form-anunciar');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prod-name').value;
    const category = document.getElementById('prod-cat').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const image_url = document.getElementById('prod-img').value;
    const description = document.getElementById('prod-desc').value;

    const { error } = await supabase.from('products').insert([
      { name, category, price, image_url, description, stock: 10, status: 'active' }
    ]);

    if (error) {
      alert('Erro ao publicar produto: ' + error.message);
    } else {
      alert('Produto publicado com sucesso!');
      window.location.href = 'index.html';
    }
  });
}