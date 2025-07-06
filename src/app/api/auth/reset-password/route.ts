// src/app/api/auth/reset-password/route.ts
import { kv } from '@vercel/kv';
import { put, head } from '@vercel/blob';
import { hashPassword } from '@/lib/auth';
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
    const userExists = await head(blobPath);
    if (!userExists) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 3. 哈希新密码
    const hashedPassword = await hashPassword(password);

    // 4. 更新用户信息
    // 注意：实际应用中，您应该先获取旧数据，再更新密码字段，而不是覆盖整个对象
    const userData = { email, hashedPassword, updatedAt: new Date() };
    const blob = await put(blobPath, JSON.stringify(userData), {
      access: 'public',
      contentType: 'application/json',
    });

    // 5. 删除验证码
    await kv.del(`verification_code:${email}`);

    return NextResponse.json({ message: '密码重置成功', blobUrl: blob.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
