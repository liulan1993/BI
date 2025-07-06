// src/app/api/auth/reset-password/route.ts
import { kv } from '@vercel/kv';
import { put, list } from '@vercel/blob';
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
    
    // 2. 检查用户是否存在 (关键修复：使用正确的前缀)
    const { blobs } = await list({ prefix: `users/${email}-` });

    // 如果没有找到任何文件，说明用户不存在
    if (blobs.length === 0) {
        return NextResponse.json({ error: '该邮箱地址未注册' }, { status: 404 });
    }
    
    // 默认使用找到的第一个blob文件
    const userBlob = blobs[0];

    // 3. 哈希新密码
    const hashedPassword = await hashPassword(password);

    // 4. 更新用户信息
    const oldUserResponse = await fetch(userBlob.url);
    if (!oldUserResponse.ok) {
        throw new Error('获取用户信息时出错，请稍后重试');
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
    return NextResponse.json({ error: '操作失败，请稍后重试' }, { status: 500 });
  }
}
