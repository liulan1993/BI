// src/app/api/auth/reset-password/route.ts
import { kv } from '@vercel/kv';
import { put, list } from '@vercel/blob'; // 引入 list 方法
import { hashPassword } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, code, password } = await request.json();

    // 1. 验证验证码
    const storedCode = await kv.get(`verification_code:${email}`);
    if (!storedCode || String(storedCode) !== code) {
      return NextResponse.json({ error: '邮箱验证码不正确' }, { status: 400 });
    }
    
    // 2. 检查用户是否存在
    // 关键修复：同样使用 list 方法来查找用户文件
    const { blobs } = await list({ prefix: `users/${email}` });
    const userBlob = blobs.find(blob => blob.pathname.startsWith(`users/${email}-`));

    if (!userBlob) {
        return NextResponse.json({ error: '该邮箱未注册' }, { status: 404 });
    }

    // 3. 哈希新密码
    const hashedPassword = await hashPassword(password);

    // 4. 更新用户信息
    const oldUserResponse = await fetch(userBlob.url, {
        headers: {
            'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
        }
    });
    if (!oldUserResponse.ok) {
        throw new Error('获取旧用户信息失败');
    }
    const oldUserData = await oldUserResponse.json();
    
    const newUserData = { ...oldUserData, hashedPassword, updatedAt: new Date().toISOString() };
    
    // 使用完整的、带随机后缀的路径来更新文件
    await put(userBlob.pathname, JSON.stringify(newUserData), {
      access: 'public',
      contentType: 'application/json',
    });

    // 5. 删除验证码
    await kv.del(`verification_code:${email}`);

    return NextResponse.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
