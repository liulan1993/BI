// src/app/api/auth/reset-password/route.ts
import { kv } from '@vercel/kv';
import { put, head } from '@vercel/blob'; // 移除了 get 方法
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
    const blobPath = `users/${email}.json`;
    const userBlob = await head(blobPath);
    if (!userBlob) {
        return NextResponse.json({ error: '该邮箱未注册' }, { status: 404 });
    }

    // 3. 哈希新密码
    const hashedPassword = await hashPassword(password);

    // 4. 更新用户信息
    // 关键修复：同样改回使用 fetch 方法来获取旧数据
    if (!process.env.BLOB_URL || !process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("服务器缺少 Blob 存储的配置信息");
    }
    const blobUrl = `${process.env.BLOB_URL}/${blobPath}`;
    const response = await fetch(blobUrl, {
        headers: { 'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    });
    if (!response.ok) {
        throw new Error('获取旧用户信息失败');
    }
    const oldUserData = await response.json();
    
    const newUserData = { ...oldUserData, hashedPassword, updatedAt: new Date().toISOString() };
    
    await put(blobPath, JSON.stringify(newUserData), {
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
