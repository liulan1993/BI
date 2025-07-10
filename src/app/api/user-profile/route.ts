// src/app/api/user-profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// 获取当前用户的个人资料（包括“重点关注”列表）
export async function GET() {
  // 从 cookie 中获取会话信息
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  // 解密会话以获取用户信息
  const session = await decrypt(sessionCookie);
  if (!session?.sub) { // 'sub' 存储的是邮箱
    return NextResponse.json({ error: '无效的会话' }, { status: 401 });
  }

  const userEmail = session.sub;

  try {
    // 使用 supabaseAdmin 客户端和用户邮箱查询 profiles 表
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('favorites')
      .eq('user_email', userEmail) // 查询条件是 user_email
      .single(); // 期望只返回一行或零行

    // 如果出错，但错误不是“未找到行”，则抛出异常
    if (error && error.code !== 'PGRST116') { 
      throw error;
    }

    // 返回收藏列表，如果不存在则返回空数组
    return NextResponse.json({ favorites: data?.favorites || [] });
  } catch (error: any) {
    console.error('Error fetching profile by email:', error);
    return NextResponse.json({ error: '获取个人资料失败', details: error.message }, { status: 500 });
  }
}

// 更新用户的“重点关注”列表
export async function POST(request: Request) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const session = await decrypt(sessionCookie);
  if (!session?.sub) {
    return NextResponse.json({ error: '无效的会话' }, { status: 401 });
  }

  const userEmail = session.sub;
  const { favorites } = await request.json(); // 从请求体中获取新的收藏列表

  if (!Array.isArray(favorites)) {
    return NextResponse.json({ error: '无效的 favorites 格式' }, { status: 400 });
  }

  try {
    // 使用 upsert 操作：
    // 1. 如果 user_email 对应的行已存在，则更新其 favorites 字段。
    // 2. 如果不存在，则插入一个新行。
    // onConflict: 'user_email' 告诉 Supabase 将 user_email 列作为判断冲突的依据。
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(
        { 
          user_email: userEmail,
          favorites: favorites,
        },
        { onConflict: 'user_email' }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating profile by email:', error);
    return NextResponse.json({ error: '更新个人资料失败', details: error.message }, { status: 500 });
  }
}
