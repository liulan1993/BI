    // src/lib/supabaseClient.ts
    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or an on key is not defined in environment variables.');
    }

    // 创建并导出 Supabase 客户端实例
    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    