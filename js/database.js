// Configuração do cliente Supabase para JavaScript Puro (Vanilla)
// Substitua pelas suas credenciais obtidas no painel do Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://tgfsmzvrvwyyqaglcjlk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4u_wcUp8Ii9n14FzPYYwMw_3NvB9P5w';


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);