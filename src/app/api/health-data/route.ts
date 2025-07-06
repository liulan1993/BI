// src/app/api/health-data/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '../../../lib/auth'; // 使用我们之前创建的解密函数
import { supabase } from '../../../lib/supabaseClient';

export async function GET() {
  // 1. 从 Cookie 中获取并解密会话
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const session = await decrypt(sessionCookie);
  if (!session?.sub) {
    return NextResponse.json({ error: '无效的会话' }, { status: 401 });
  }

  const userEmail = session.sub; // 从会话中获取用户邮箱

  try {
    // 2. 使用 Supabase 客户端查询数据
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_email', userEmail) // 只查询属于当前登录用户的数据
      .order('recorded_at', { ascending: true }); // 按时间排序

    if (error) {
      throw error;
    }

    // 3. 返回查询到的数据
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Supabase query error:', error);
    return NextResponse.json({ error: '获取健康数据失败', details: error.message }, { status: 500 });
  }
}
