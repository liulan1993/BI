// src/app/api/auth/login/route.ts
import { comparePassword, encrypt } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. 从 Vercel Blob 获取用户信息
    // 注意: 此处URL需要根据您的Vercel项目动态调整或通过环境变量获取
    const userBlobUrl = `https://${process.env.VERCEL_URL}/api/blob/users/${email}.json`;
    const response = await fetch(`${process.env.BLOB_URL}/users/${email}.json`, {
        headers: {
            'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
        }
    });

    if (response.status === 404) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 400 });
    }
    if (!response.ok) {
        throw new Error('Failed to fetch user data from blob');
    }

    const user = await response.json();

    // 2. 验证密码
    const isPasswordValid = await comparePassword(password, user.hashedPassword);
    if (!isPasswordValid) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 400 });
    }

    // 3. 创建会话
    const session = await encrypt({ sub: user.email, name: user.name });

    // 4. 设置 cookie
    cookies().set('session', session, { httpOnly: true, secure: true, path: '/' });

    return NextResponse.json({ message: '登录成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
