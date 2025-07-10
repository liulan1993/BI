// src/app/api/user-profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// 获取当前用户的个人资料（包括“重点关注”列表）
export async function GET() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const session = await decrypt(sessionCookie);
  if (!session?.sub) { // 'sub' 存储的是邮箱
    return NextResponse.json({ error: '无效的会话' }, { status: 401 });
  }

  const userEmail = session.sub;

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('favorites')
      .eq('user_email', userEmail) // 关键修改：通过 email 查询
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: a single row was not returned
      throw error;
    }

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
  const { favorites } = await request.json();

  if (!Array.isArray(favorites)) {
    return NextResponse.json({ error: '无效的 favorites 格式' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(
        { 
          user_email: userEmail, // 关键修改：使用 email 作为关联键
          favorites: favorites,
          updated_at: new Date().toISOString() 
        },
        { onConflict: 'user_email' } // 假设 'user_email' 是唯一的，用于判断更新或插入
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