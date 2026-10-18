# PorLares — Marketplace de Produtos para o Lar 🏠

Plataforma moderna, intuitiva e segura para compra e venda de itens voltados para o lar: móveis, decoração, eletrodomésticos, utensílios domésticos, organização e reforma. As negociações de pagamento, entrega ou retirada acontecem diretamente entre comprador e vendedor pelo **WhatsApp**, sem taxas ou intermediários.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** HTML5 Semântico, Vanilla CSS (Design System próprio, responsivo e minimalista) e Vanilla JavaScript (ES Modules modernos).
- **Ícones:** Lucide Icons.
- **Backend as a Service:** [Supabase](https://supabase.com):
  - **Supabase Auth:** Autenticação real com gerenciamento seguro de sessões.
  - **PostgreSQL Database:** Armazenamento relacional com Row Level Security (RLS) habilitado.
  - **Supabase Storage:** Armazenamento das fotos dos anúncios no bucket `product-images`.
- **Comunicação:** Integração direta com a API do WhatsApp (`wa.me`).

---

## 📁 Estrutura de Arquivos

```
Porlares/
├── css/
│   └── style.css            # Folha de estilos unificada e moderna
├── js/
│   ├── auth.js              # Lógica de login, cadastro e controle de sessão
│   ├── carrinho.js          # Carrinho com agrupamento por vendedor e WhatsApp
│   ├── main.js              # Catálogo, busca em tempo real, filtros e modal "Ver mais"
│   ├── meus-produtos.js     # Painel do vendedor: status (Para venda / Vendido) e exclusão
│   ├── navbar.js            # Cabeçalho global, sincronização do usuário e badges
│   ├── produtos.js          # Publicação de anúncios e upload múltiplo de fotos
│   └── supabase-client.js   # Cliente Supabase centralizado, utilitários e dados de demonstração
├── cadastro.html            # Tela de criação de conta
├── carrinho.html            # Tela do carrinho de compras
├── index.html               # Vitrine principal / Catálogo de produtos
├── login.html               # Tela de login
├── meus-produtos.html       # Aba exclusiva do vendedor logado
├── produtos.html            # Formulário para anunciar produtos ("Vender")
├── supabase_schema.sql      # Script SQL completo com tabelas, RLS e dados de exemplo
└── README.md                # Documentação do projeto
```

---

## ⚙️ Configuração do Supabase

As credenciais do projeto já estão centralizadas no arquivo [`js/supabase-client.js`](file:///c:/Users/Rhikellmy/Porlares/js/supabase-client.js):
- **URL do Projeto:** `https://tgfsmzvrvwyyqaglcjlk.supabase.co`
- **Chave Publicável:** `sb_publishable_T4GvtWNBKhscrkYIgetgxw_A9rUVLQ5`

### 1. Execução do Script SQL
Para criar/atualizar as tabelas `products`, `product_images`, `profiles`, ativar as políticas de segurança (RLS) e carregar os dados de demonstração:
1. Acesse o painel do Supabase do seu projeto.
2. No menu lateral, clique em **SQL Editor** -> **New Query**.
3. Abra o arquivo [`supabase_schema.sql`](file:///c:/Users/Rhikellmy/Porlares/supabase_schema.sql), copie todo o conteúdo e cole no editor.
4. Clique em **Run** (Executar).

### 2. Ativação do Provedor de E-mail (Auth)
Para permitir que novos usuários se cadastrem e façam login:
1. No painel do Supabase, vá em **Authentication** -> **Providers**.
2. Clique na opção **Email**.
3. Ative a chave **Enable Email provider**.
4. *(Opcional para testes acadêmicos)*: Desmarque **Confirm email** se desejar que a conta seja ativada imediatamente sem aguardar clique em link de confirmação no e-mail.

### 3. Bucket de Imagens (Storage)
O script SQL já cria o bucket e as políticas de segurança. Se desejar verificar ou criar manualmente:
1. No menu lateral, clique em **Storage**.
2. Certifique-se de que existe um bucket chamado `product-images` configurado como **Public**.

---

## 💻 Como Executar Localmente

Como o projeto utiliza **JavaScript ES Modules** (`import` / `export`), os arquivos devem ser servidos por um servidor HTTP local simples (não abra via `file:///` direto no navegador).

### Opção 1: Usando Node.js (Recomendado)
No terminal do projeto, execute:
```bash
npx serve .
# ou
npx http-server . -p 3000
```
Em seguida, abra no navegador: `http://localhost:3000`.

### Opção 2: Extensão Live Server (VS Code)
1. Instale a extensão **Live Server** no VS Code.
2. Clique com o botão direito no arquivo `index.html` e selecione **Open with Live Server**.

### Opção 3: Usando Python
Se tiver Python instalado:
```bash
python -m http.server 3000
```
Acesse `http://localhost:3000`.

---

## 🌟 Principais Funcionalidades

1. **Vitrine & Catálogo Interativo:**
   - Visualização de todos os produtos com status ativo.
   - Produtos de demonstração pré-configurados com WhatsApp (`55119448029642`).
   - Busca em tempo real por nome, categoria ou descrição.
   - Filtros rápidos por pílulas de categorias do lar.

2. **Detalhes do Produto ("Ver mais"):**
   - Modal com galeria de fotos (imagem principal + miniaturas navegáveis).
   - Descrição detalhada do vendedor e status de disponibilidade.
   - Botão direto para conversar com o vendedor no WhatsApp com mensagem inicial contextualizada.
   - Botão para adicionar ao carrinho.

3. **Publicação de Produtos ("Vender"):**
   - Acesso protegido: exige login do vendedor.
   - Seleção de múltiplas imagens direto do computador com prévia visual instantânea e opção de remover.
   - Upload automático para o Supabase Storage.
   - Vinculação obrigatória ao `user_id` do vendedor e número de WhatsApp.

4. **Painel "Meus Produtos":**
   - Visão exclusiva dos anúncios criados pelo usuário logado.
   - Contador de anúncios totais, ativos e vendidos.
   - Alternância de status com 1 clique:
     - De "Para venda" -> "Vendido" (o item é imediatamente retirado do catálogo público).
     - De "Vendido" -> "Para venda" (o item volta a ficar visível publicamente).
   - Exclusão permanente de anúncios com confirmação.

5. **Carrinho com Agrupamento por Vendedor:**
   - Permite selecionar produtos de vendedores diferentes.
   - **Agrupamento inteligente:** os itens são agrupados por vendedor/loja.
   - Cada grupo exibe seus produtos, preços, quantidades e subtotal do vendedor.
   - Botão **"Negociar Grupo no WhatsApp"**: gera mensagem detalhada com todos os produtos daquele vendedor específico e **remove apenas os itens daquele vendedor**, mantendo intactos os itens dos demais vendedores.
   - Botão **"Esvaziar Carrinho"** para limpar toda a seleção.
   - Contador em tempo real no cabeçalho em todas as páginas.

6. **Autenticação:**
   - Cadastro e Login reais via Supabase Auth.
   - Feedback em português com tratamento de erros (ex: credenciais incorretas, e-mail já cadastrado, aviso sobre provedor desativado).
   - Sessão persistida e botão para Sair da Conta.
