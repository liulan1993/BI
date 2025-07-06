// src/app/api/auth/login/route.ts
import { list } from '@vercel/blob';
import { comparePassword, encrypt } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. 从 Vercel Blob 获取用户信息
    // 关键修复：使用 list 方法来查找用户文件，因为文件名包含随机后缀
    const { blobs } = await list({ prefix: `users/${email}` });

    // 从搜索结果中精确找到匹配的文件
    // Vercel Blob 会在邮箱后添加一个'-'和随机字符串
    const userBlob = blobs.find(blob => blob.pathname.startsWith(`users/${email}-`));

    // 如果找不到任何匹配的文件，说明用户不存在
    if (!userBlob) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 400 });
    }

    // 直接使用找到的 blob 的 url 来安全地获取内容
    const response = await fetch(userBlob.url, {
        headers: {
            // 注意：访问私有 blob 的 url 时通常不需要额外的 auth token，
            // 但如果您的 blob 是私有的，并且 url 是临时的，则可能需要。
            // 对于公共 blob，则不需要此 header。为保险起见，我们保留它。
            'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
        }
    });
    
    if (!response.ok) {
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
