// src/app/api/auth/reset-password/route.ts
import { kv } from '@vercel/kv';
import { put, head } from '@vercel/blob';
import { hashPassword } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, code, password } = await request.json();

    // 1. 验证验证码
    const storedCode = await kv.get(`verification_code:${email}`);
    if (!storedCode || storedCode !== code) {
      return NextResponse.json({ error: '邮箱验证码不正确' }, { status: 400 });
    }
    
    // 2. 检查用户是否存在
    const blobPath = `users/${email}.json`;
    const userBlob = await head(blobPath);
    if (!userBlob) {
        return NextResponse.json({ error: '该邮箱未注册' }, { status: 404 });
    }

    // 3. 哈希新密码
    const hashedPassword = await hashPassword(password);

    // 4. 更新用户信息
    const response = await fetch(`${process.env.BLOB_URL}/${blobPath}`, {
        headers: { 'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    });
    const oldUserData = await response.json();
    
    const newUserData = { ...oldUserData, hashedPassword, updatedAt: new Date().toISOString() };
    
    const blob = await put(blobPath, JSON.stringify(newUserData), {
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
