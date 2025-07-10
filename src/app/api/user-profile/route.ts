import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 获取当前用户的个人资料（包括“重点关注”列表）
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('favorites')
    .eq('id', session.user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: a single row was not returned
    console.error('Error fetching profile:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch profile' }), { status: 500 });
  }

  return NextResponse.json({ favorites: data?.favorites || [] });
}

// 更新用户的“重点关注”列表
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { favorites } = await request.json();

  if (!Array.isArray(favorites)) {
    return new NextResponse(JSON.stringify({ error: 'Invalid favorites format' }), { status: 400 });
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ 
      id: session.user.id, 
      favorites: favorites,
      updated_at: new Date().toISOString() 
    })
    .eq('id', session.user.id);

  if (error) {
    console.error('Error updating profile:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update profile' }), { status: 500 });
  }

  return NextResponse.json({ success: true });
}
