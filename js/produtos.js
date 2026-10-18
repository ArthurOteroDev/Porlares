// =====================================================================
// PROJETO PORLARES — PUBLICAÇÃO DE PRODUTOS COM UPLOAD DE IMAGENS
// =====================================================================
import { 
  supabase, 
  getSessionUser, 
  showToast, 
  cleanPhone 
} from './supabase-client.js';

let selectedFiles = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  await checkUserAuth();
  setupImageUpload();
  setupPhoneFormatting();
  setupPublishForm();
});

// ---------------------------------------------------------------------
// 1. VERIFICAÇÃO DE AUTENTICAÇÃO OBRIGATÓRIA
// ---------------------------------------------------------------------
async function checkUserAuth() {
  currentUser = await getSessionUser();
  const banner = document.getElementById('auth-required-banner');
  const form = document.getElementById('form-anunciar');

  if (!currentUser) {
    if (banner) banner.style.display = 'block';
    if (form) {
      const inputs = form.querySelectorAll('input, select, textarea, button');
      inputs.forEach(el => el.disabled = true);
    }
    showToast('Você precisa entrar na sua conta para publicar um produto.', 'info', 5000);
  } else {
    if (banner) banner.style.display = 'none';
    // Se o usuário tiver WhatsApp salvo nos metadados, pré-preencher
    const savedWa = currentUser.user_metadata?.whatsapp;
    const waInput = document.getElementById('prod-whatsapp');
    if (savedWa && waInput && !waInput.value) {
      waInput.value = formatPhoneMask(savedWa);
    }
  }
}

// ---------------------------------------------------------------------
// 2. SELEÇÃO E PRÉVIA DE IMAGENS DO COMPUTADOR
// ---------------------------------------------------------------------
function setupImageUpload() {
  const fileInput = document.getElementById('prod-images-input');
  const previewsContainer = document.getElementById('image-previews-container');
  if (!fileInput || !previewsContainer) return;

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFilesSelected(files);
    // Limpar o valor do input para permitir selecionar os mesmos arquivos novamente se desejar
    fileInput.value = '';
  });

  // Suporte a arrastar e soltar (drag & drop)
  const dropzone = document.getElementById('upload-zone');
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--brand-teal)';
        dropzone.style.background = 'var(--brand-teal-light)';
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-color)';
        dropzone.style.background = '#F8FAFC';
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer?.files) {
        handleFilesSelected(Array.from(e.dataTransfer.files));
      }
    });
  }
}

function handleFilesSelected(files) {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      showToast(`O arquivo "${file.name}" não é uma imagem válida.`, 'error');
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast(`A imagem "${file.name}" excede o tamanho máximo de 5MB.`, 'error');
      continue;
    }

    // Evitar adicionar o mesmo arquivo repetido
    if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
      selectedFiles.push(file);
    }
  }

  renderImagePreviews();
}

function renderImagePreviews() {
  const container = document.getElementById('image-previews-container');
  if (!container) return;

  container.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const previewBox = document.createElement('div');
    previewBox.className = 'preview-thumb-box';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'preview-remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'Remover esta foto';
    removeBtn.onclick = () => {
      selectedFiles.splice(index, 1);
      renderImagePreviews();
    };

    previewBox.appendChild(img);
    previewBox.appendChild(removeBtn);
    container.appendChild(previewBox);
  });
}

// ---------------------------------------------------------------------
// 3. FORMATAÇÃO DO WHATSAPP
// ---------------------------------------------------------------------
function setupPhoneFormatting() {
  const phoneInput = document.getElementById('prod-whatsapp');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    e.target.value = formatPhoneMask(e.target.value);
  });
}

function formatPhoneMask(val) {
  const digits = String(val).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// ---------------------------------------------------------------------
// 4. ENVIO E PUBLICAÇÃO DO ANÚNCIO
// ---------------------------------------------------------------------
function setupPublishForm() {
  const form = document.getElementById('form-anunciar');
  if (!form) return;

  const submitBtn = document.getElementById('btn-submit-publish');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('Por favor, faça login para publicar.', 'error');
      window.location.href = 'login.html?redirect=produtos.html';
      return;
    }

    const name = document.getElementById('prod-name').value.trim();
    const category = document.getElementById('prod-cat').value;
    const priceVal = parseFloat(document.getElementById('prod-price').value);
    const whatsappInput = document.getElementById('prod-whatsapp').value.trim();
    const stockVal = parseInt(document.getElementById('prod-stock').value, 10) || 1;
    const description = document.getElementById('prod-desc').value.trim();

    // Validações
    if (!name || !category || isNaN(priceVal) || priceVal < 0) {
      showError('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const cleanedPhone = cleanPhone(whatsappInput);
    if (!cleanedPhone || cleanedPhone.length < 10) {
      showError('Por favor, informe um número de WhatsApp válido com DDD.');
      return;
    }

    if (selectedFiles.length === 0) {
      showError('Por favor, selecione pelo menos 1 foto do produto.');
      return;
    }

    clearMessages();
    setSubmitting(submitBtn, true, 'Fazendo upload das imagens e salvando anúncio...');

    try {
      // 1. Fazer upload de todas as imagens para o Supabase Storage
      const uploadedUrls = await uploadImages(selectedFiles, currentUser.id);

      if (!uploadedUrls || uploadedUrls.length === 0) {
        throw new Error('Não foi possível processar as imagens do anúncio.');
      }

      const primaryImageUrl = uploadedUrls[0];

      // 2. Preparar dados para inserção na tabela products
      let payload = {
        name,
        category,
        price: priceVal,
        description,
        stock: stockVal,
        status: 'active',
        image_url: primaryImageUrl,
        whatsapp: cleanedPhone,
        user_id: currentUser.id
      };

      // 3. Inserir produto no Supabase
      let insertResult = await supabase.from('products').insert([payload]).select();

      // Caso o banco ainda não possua as colunas user_id ou whatsapp (antes da execução do SQL)
      if (insertResult.error && insertResult.error.message?.includes('column')) {
        console.warn('Tentando inserção com colunas básicas devido à estrutura inicial:', insertResult.error.message);
        
        // Incluir o WhatsApp e o anunciante na descrição como garantia até que o SQL seja executado
        const backupDesc = `${description}\n\n[Contato WhatsApp: ${cleanedPhone}]\n[Anunciante: ${currentUser.email}]`;
        payload = {
          name,
          category,
          price: priceVal,
          description: backupDesc,
          stock: stockVal,
          status: 'active',
          image_url: primaryImageUrl
        };
        insertResult = await supabase.from('products').insert([payload]).select();
      }

      if (insertResult.error) {
        throw insertResult.error;
      }

      const createdProduct = insertResult.data && insertResult.data[0];

      // 4. Se houver mais imagens, salvar na tabela product_images
      if (createdProduct && uploadedUrls.length > 1) {
        const extraImages = uploadedUrls.slice(1).map(url => ({
          product_id: createdProduct.id,
          image_url: url
        }));

        try {
          await supabase.from('product_images').insert(extraImages);
        } catch (imgErr) {
          console.warn('Aviso: imagens adicionais não salvas (tabela product_images pode estar pendente):', imgErr);
        }
      }

      // Sucesso!
      showSuccess(`
        <strong>Parabéns! Seu anúncio foi publicado com sucesso no PorLares.</strong><br>
        Redirecionando para o catálogo...
      `);
      showToast('Produto anunciado com sucesso!', 'success');

      // Limpar formulário
      form.reset();
      selectedFiles = [];
      renderImagePreviews();

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);

    } catch (err) {
      console.error('Erro ao publicar produto:', err);
      showError(`Não foi possível salvar o anúncio: ${err.message || 'Erro desconhecido.'}`);
    } finally {
      setSubmitting(submitBtn, false, 'Publicar Anúncio');
    }
  });
}

// ---------------------------------------------------------------------
// 5. HELPER DE UPLOAD DE IMAGENS (SUPABASE STORAGE + FALLBACK)
// ---------------------------------------------------------------------
async function uploadImages(files, userId) {
  const urls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}_${Date.now()}_${i}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    try {
      // Tentar enviar para o bucket 'product-images' do Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          urls.push(publicData.publicUrl);
          continue;
        }
      }

      // Se der erro no storage (ex: bucket ainda não criado), converter para DataURL seguro
      console.warn('Storage indisponível, gerando DataURL para teste:', error?.message);
      const dataUrl = await fileToDataUrl(file);
      urls.push(dataUrl);

    } catch (e) {
      console.warn('Falha no upload para storage, usando fallback:', e.message);
      const dataUrl = await fileToDataUrl(file);
      urls.push(dataUrl);
    }
  }

  return urls;
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

function showError(msg) {
  const box = document.getElementById('publish-error-box');
  if (box) {
    box.innerHTML = msg;
    box.style.display = 'block';
  }
}

function showSuccess(msg) {
  const box = document.getElementById('publish-success-box');
  if (box) {
    box.innerHTML = msg;
    box.style.display = 'block';
  }
}

function clearMessages() {
  const err = document.getElementById('publish-error-box');
  const succ = document.getElementById('publish-success-box');
  if (err) err.style.display = 'none';
  if (succ) succ.style.display = 'none';
}

function setSubmitting(btn, isSubmitting, text) {
  if (!btn) return;
  btn.disabled = isSubmitting;
  btn.style.opacity = isSubmitting ? '0.7' : '1';
  btn.style.cursor = isSubmitting ? 'not-allowed' : 'pointer';
  btn.innerHTML = isSubmitting 
    ? `<span>${text}</span>` 
    : `<i data-lucide="check-circle" style="width: 18px; height: 18px;"></i><span>${text}</span>`;
  if (window.lucide) window.lucide.createIcons();
}