// src/app/api/auth/login/route.ts
import { list } from '@vercel/blob';
import { comparePassword, encrypt } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. 查找用户文件
    const { blobs } = await list({ prefix: `users/${email}-` });

    // 关键修改：如果未找到用户，明确提示“该账号未注册”
    if (blobs.length === 0) {
      return NextResponse.json({ error: '该账号未注册' }, { status: 404 }); // 404 Not Found
    }

    // 默认使用找到的第一个blob文件
    const userBlob = blobs[0];

    // 2. 获取用户信息并验证密码
    const response = await fetch(userBlob.url);
    if (!response.ok) {
        throw new Error('获取用户信息时出错');
    }
    const user = await response.json();

    const isPasswordValid = await comparePassword(password, user.hashedPassword);
    // 如果密码不正确，返回模糊提示
    if (!isPasswordValid) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 400 });
    }

    // 3. 创建并设置会话 Cookie
    const session = await encrypt({ sub: user.email, name: user.name });
    cookies().set('session', session, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

    return NextResponse.json({ message: '登录成功' });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: '操作失败，请稍后重试' }, { status: 500 });
  }
}
