// src/app/api/auth/send-verification/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// 设置 SendGrid API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: Request) {
  // 检查环境变量是否设置
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_VERIFIED_EMAIL) {
    console.error('SendGrid API Key or verified email is not set in environment variables.');
    return NextResponse.json({ error: '邮件服务未正确配置' }, { status: 500 });
  }

  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: '邮箱地址不能为空' }, { status: 400 });
    }

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `verification_code:${email}`;

    // 将验证码存入 Vercel KV (Redis)，有效期5分钟
    await kv.set(key, code, { ex: 300 });

    // 准备邮件内容
    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_EMAIL, // 使用您在 SendGrid 验证过的邮箱
      subject: '您的登录验证码',
      text: `您的验证码是：${code}。该验证码将在5分钟后失效。`,
      html: `<div style="font-family: sans-serif; text-align: center; padding: 20px;">
               <h2>您的验证码</h2>
               <p>感谢您使用我们的服务。您的验证码是：</p>
               <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; display: inline-block;">${code}</p>
               <p>该验证码将在5分钟后失效。</p>
             </div>`,
    };

    // 通过 SendGrid 发送邮件
    await sgMail.send(msg);

    return NextResponse.json({ message: '验证码已成功发送' });
  } catch (error) {
    console.error('Error sending email with SendGrid:', error);
    
    // 尝试解析 SendGrid 返回的更详细错误信息
    if (error instanceof Error && 'response' in error) {
        const sgError = error as any;
        console.error('SendGrid response body:', sgError.response.body);
    }
    
    return NextResponse.json({ error: '邮件发送失败，请稍后重试' }, { status: 500 });
  }
}
