// src/app/api/auth/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * @description 处理用户退出登录请求
 * 该接口通过清除会话 cookie 来实现退出登录
 */
export async function POST() {
  try {
    // 获取 cookies 实例
    const cookieStore = cookies();

    // 清除 'session' cookie
    cookieStore.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(0), // 设置一个过去的日期，使 cookie 立即失效
    });

    return NextResponse.json({ message: '退出成功' });
  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json({ error: '操作失败，请稍后重试' }, { status: 500 });
  }
}
