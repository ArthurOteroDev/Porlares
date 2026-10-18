-- =====================================================================
-- PROJETO PORLARES — ESQUEMA COMPLETO DO BANCO DE DADOS (SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase
-- (https://supabase.com/dashboard/project/tgfsmzvrvwyyqaglcjlk/sql)
-- =====================================================================

-- 1. TABELA PRINCIPAL DE PRODUTOS
-- Criação ou atualização da tabela products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 1,
    whatsapp TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Garantir colunas essenciais caso a tabela já tenha sido criada anteriormente
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 1;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Índices para otimização de busca e filtragem
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 2. TABELA DE IMAGENS ADICIONAIS DO PRODUTO (GALERIA)
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- 3. TABELA DE PERFIS DE USUÁRIO (OPCIONAL/COMPLEMENTAR)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    whatsapp TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now())
);

-- 4. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE SEGURANÇA PARA A TABELA PRODUCTS

-- Leitura pública: qualquer pessoa pode visualizar produtos ativos
DROP POLICY IF EXISTS "Permitir leitura pública de produtos ativos" ON public.products;
DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON public.products;
CREATE POLICY "Permitir leitura pública de produtos" 
ON public.products FOR SELECT 
USING (
    status = 'active' 
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Inserção: apenas usuários autenticados podem anunciar produtos
DROP POLICY IF EXISTS "Permitir inserção para usuários logados" ON public.products;
CREATE POLICY "Permitir inserção para usuários logados" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
);

-- Atualização: apenas o criador do anúncio pode alterar (ex: marcar como vendido)
DROP POLICY IF EXISTS "Permitir atualização para o dono do produto" ON public.products;
CREATE POLICY "Permitir atualização para o dono do produto" 
ON public.products FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Exclusão: apenas o criador pode remover o anúncio
DROP POLICY IF EXISTS "Permitir exclusão para o dono do produto" ON public.products;
CREATE POLICY "Permitir exclusão para o dono do produto" 
ON public.products FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 6. POLÍTICAS DE SEGURANÇA PARA A TABELA PRODUCT_IMAGES

-- Leitura pública das imagens
DROP POLICY IF EXISTS "Permitir leitura de imagens" ON public.product_images;
CREATE POLICY "Permitir leitura de imagens" 
ON public.product_images FOR SELECT 
USING (true);

-- Inserção de imagens pelo dono do produto
DROP POLICY IF EXISTS "Permitir inserção de imagens para autenticados" ON public.product_images;
CREATE POLICY "Permitir inserção de imagens para autenticados" 
ON public.product_images FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.products p 
        WHERE p.id = product_id 
        AND (p.user_id = auth.uid() OR p.user_id IS NULL)
    )
);

-- Exclusão de imagens pelo dono do produto
DROP POLICY IF EXISTS "Permitir exclusão de imagens pelo dono" ON public.product_images;
CREATE POLICY "Permitir exclusão de imagens pelo dono" 
ON public.product_images FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.products p 
        WHERE p.id = product_id 
        AND p.user_id = auth.uid()
    )
);

-- 7. POLÍTICAS DE SEGURANÇA PARA PROFILES
DROP POLICY IF EXISTS "Perfis públicos para leitura" ON public.profiles;
CREATE POLICY "Perfis públicos para leitura" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Usuário atualiza o próprio perfil" ON public.profiles;
CREATE POLICY "Usuário atualiza o próprio perfil" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário insere o próprio perfil" ON public.profiles;
CREATE POLICY "Usuário insere o próprio perfil" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 8. CONFIGURAÇÃO DO BUCKET DE ARMAZENAMENTO (STORAGE)
-- Criação do bucket público 'product-images' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para o bucket 'product-images'
DROP POLICY IF EXISTS "Acesso público às imagens de produtos" ON storage.objects;
CREATE POLICY "Acesso público às imagens de produtos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Upload de imagens para usuários autenticados" ON storage.objects;
CREATE POLICY "Upload de imagens para usuários autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Deleção de imagens para usuários autenticados" ON storage.objects;
CREATE POLICY "Deleção de imagens para usuários autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- 9. DADOS DE DEMONSTRAÇÃO (SEED CONTROLADO)
-- Insere produtos de exemplo apenas se a tabela estiver vazia
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
        INSERT INTO public.products (id, name, description, price, category, image_url, stock, whatsapp, status)
        VALUES
        (
            '11111111-1111-1111-1111-111111111111',
            'Sofá Retrátil e Reclinável 3 Lugares Veludo Bege',
            'Sofá retrátil e reclinável de 3 lugares, revestido em tecido veludo bege de toque suave. Estrutura em madeira maciça tratada, molas ensacadas e espuma D33. Em excelente estado de conservação.',
            1890.00,
            'Móveis',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
            1,
            '11948029642',
            'active'
        ),
        (
            '22222222-2222-2222-2222-222222222222',
            'Luminária Pendente Nórdica em Alumínio e Madeira',
            'Luminária pendente de design escandinavo, acabamento preto fosco com detalhe nobre em madeira maciça. Soquete padrão E27, bivolt. Cabo ajustável de até 1,5 metro.',
            249.90,
            'Decoração',
            'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
            3,
            '11948029642',
            'active'
        ),
        (
            '33333333-3333-3333-3333-333333333333',
            'Jogo de Panelas Cerâmica Antiaderente 5 Peças',
            'Conjunto completo de 5 panelas com revestimento cerâmico ecológico livre de PFOA e metais pesados. Cabos antitérmicos soft touch e tampas de vidro temperado com saída de vapor.',
            420.00,
            'Cozinha e utensílios',
            'https://images.unsplash.com/photo-1584990347449-39726245367b?w=800&auto=format&fit=crop&q=80',
            2,
            '11948029642',
            'active'
        ),
        (
            '44444444-4444-4444-4444-444444444444',
            'Cafeteira Espresso Automática 15 Bar',
            'Cafeteira espresso compacta com pressão de 15 bar, sistema thermo-block de aquecimento rápido e bico vaporizador para leite. Acompanha filtros para pó e sachê.',
            680.00,
            'Eletrodomésticos',
            'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
            1,
            '11948029642',
            'active'
        ),
        (
            '55555555-5555-5555-5555-555555555555',
            'Mesa de Cabeceira Industrial em Ferro e Madeira',
            'Mesa de cabeceira com estrutura metálica em pintura eletrostática preta fosca e prateleiras em MDF tom carvalho natural. Ideal para organizar livros, luminária e acessórios.',
            290.00,
            'Quarto e cama',
            'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&auto=format&fit=crop&q=80',
            2,
            '11948029642',
            'active'
        ),
        (
            '66666666-6666-6666-6666-666666666666',
            'Vaso Decorativo Minimalista em Cerâmica Terracota',
            'Peça artesanal de cerâmica com textura rústica e acabamento terracota fosco. Perfeito para arranjos florais secos, ramos de eucalipto ou decoração de mesas e estantes.',
            135.00,
            'Decoração',
            'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80',
            4,
            '11948029642',
            'active'
        );

        -- Imagens complementares para os produtos de demonstração
        INSERT INTO public.product_images (product_id, image_url)
        VALUES
        ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop&q=80'),
        ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'),
        ('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'),
        ('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80');
    END IF;
END $$;

-- 10. DISPENSA DE VERIFICAÇÃO DE E-MAIL (AUTO-CONFIRMAÇÃO)
-- Confirma imediatamente todos os usuários já criados sem confirmação
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- Trigger para confirmar automaticamente qualquer novo cadastro no banco
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_auto_confirm_user ON auth.users;
CREATE TRIGGER tr_auto_confirm_user
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_new_user();

