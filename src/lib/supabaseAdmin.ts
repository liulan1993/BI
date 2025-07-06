// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'

// 从环境变量中获取 Supabase 的 URL 和 Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in environment variables.')
}

// 创建并导出仅供服务器端使用的 Admin 客户端
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)