// src/app/api/auth/login/route.ts
import { comparePassword, encrypt } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. 从 Vercel Blob 获取用户信息
    const blobPath = `users/${email}.json`;
    
    // 关键修复：改回使用 fetch 方法，并增加详细的错误处理
    if (!process.env.BLOB_URL || !process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("服务器缺少 Blob 存储的配置信息");
    }

    const blobUrl = `${process.env.BLOB_URL}/${blobPath}`;
    const response = await fetch(blobUrl, {
        headers: {
            'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
        }
    });

    if (response.status === 404) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 400 });
    }
    
    if (!response.ok) {
        // 记录更详细的错误信息以供调试
        const errorText = await response.text();
        console.error(`Failed to fetch user from blob. Status: ${response.status}, Body: ${errorText}`);
        throw new Error('从数据库获取用户信息失败');
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
    cookies().set('session', session, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

    return NextResponse.json({ message: '登录成功' });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
