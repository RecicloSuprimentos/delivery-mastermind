-- 1. Criar a tabela de roles multi-tenant
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    app_name TEXT NOT NULL CHECK (app_name IN ('roterizador', 'crm')),
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, app_name)
);

-- 2. Ativar Segurança em Nível de Linha (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Politica: Usuários podem ler apenas suas próprias roles
CREATE POLICY "Users can read own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- 4. Migração: Inserir todos os 6 usuários atuais automaticamente no aplicativo 'roterizador'
INSERT INTO public.user_roles (user_id, app_name, role)
SELECT id, 'roterizador', 'admin' FROM auth.users
ON CONFLICT (user_id, app_name) DO NOTHING;
