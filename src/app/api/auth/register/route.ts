// src/app/api/auth/register/route.ts
import { kv } from '@vercel/kv';
import { put, list } from '@vercel/blob';
import { hashPassword } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto'; // 引入 crypto 用于生成唯一ID

export async function POST(request: Request) {
  try {
    const { name, email, password, code } = await request.json();

    // 1. 验证验证码
    const storedCode = await kv.get(`verification_code:${email}`);
    if (!storedCode || String(storedCode) !== code) {
      return NextResponse.json({ error: '邮箱验证码不正确' }, { status: 400 });
    }

    // 2. 检查邮箱是否已被注册 (使用正确的查找逻辑)
    const { blobs } = await list({ prefix: `users/${email}-` });
    if (blobs.length > 0) {
        return NextResponse.json({ error: '该邮箱地址已被注册' }, { status: 409 }); // 409 Conflict
    }

    // 3. 哈希密码
    const hashedPassword = await hashPassword(password);
    const userData = { name, email, hashedPassword, createdAt: new Date().toISOString() };

    // 4. 将用户信息存入 Vercel Blob (使用新的、一致的文件名格式)
    // 文件名格式: users/你的邮箱-随机ID.json
    const uniqueId = randomUUID();
    const pathname = `users/${email}-${uniqueId}.json`;

    const blob = await put(pathname, JSON.stringify(userData), {
      access: 'public',
      contentType: 'application/json',
    });
    
    // 5. 删除已使用的验证码
    await kv.del(`verification_code:${email}`);

    return NextResponse.json({ message: '注册成功', user: { name, email }, blobUrl: blob.url });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json({ error: '操作失败，请稍后重试' }, { status: 500 });
  }
}
