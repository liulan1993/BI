// src/app/api/auth/login/route.ts
import { list } from '@vercel/blob';
import { comparePassword, encrypt } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const { blobs } = await list({ prefix: `users/${email}-` });

    if (blobs.length === 0) {
      return NextResponse.json({ error: '该账号未注册' }, { status: 404 });
    }

    const userBlob = blobs[0];
    const response = await fetch(userBlob.url);
    if (!response.ok) { throw new Error('获取用户信息时出错'); }
    const user = await response.json();

    const isPasswordValid = await comparePassword(password, user.hashedPassword);
    if (!isPasswordValid) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 400 });
    }

    const session = await encrypt({ sub: user.email, name: user.name });
    cookies().set('session', session, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

    return NextResponse.json({ message: '登录成功', user: { name: user.name } });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: '操作失败，请稍后重试' }, { status: 500 });
  }
}