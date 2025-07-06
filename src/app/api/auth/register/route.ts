// src/app/api/auth/register/route.ts
import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';
import { hashPassword } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, password, code } = await request.json();

    // 1. 验证验证码
    const storedCode = await kv.get(`verification_code:${email}`);
    if (!storedCode || storedCode !== code) {
      return NextResponse.json({ error: '邮箱验证码不正确' }, { status: 400 });
    }

    // 2. 哈希密码
    const hashedPassword = await hashPassword(password);
    const userData = { name, email, hashedPassword, createdAt: new Date().toISOString() };

    // 3. 将用户信息存入 Vercel Blob
    const blob = await put(`users/${email}.json`, JSON.stringify(userData), {
      access: 'public',
      contentType: 'application/json',
    });
    
    // 4. 删除已使用的验证码
    await kv.del(`verification_code:${email}`);

    return NextResponse.json({ message: '注册成功', user: { name, email }, blobUrl: blob.url });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
