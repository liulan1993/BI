// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

/**
 * 加密数据以创建会话令牌 (JWT)
 * @param payload 要加密的数据
 * @returns 返回加密后的令牌字符串
 */
export async function encrypt(payload: any) {
  if (!secretKey) {
    throw new Error('SESSION_SECRET is not defined in environment variables');
  }
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // 会话有效期设置为1小时
    .sign(key);
}

/**
 * 解密会话令牌 (JWT) 以获取数据
 * @param input 加密的令牌字符串
 * @returns 返回解密后的数据，如果令牌无效则返回 null
 */
export async function decrypt(input: string): Promise<any> {
  if (!secretKey) {
    throw new Error('SESSION_SECRET is not defined in environment variables');
  }
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // 如果验证失败（如过期、签名不匹配），则返回 null
    console.error('Failed to verify session:', error);
    return null;
  }
}

/**
 * 对密码进行哈希加密
 * @param password 明文密码
 * @returns 返回哈希后的密码字符串
 */
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * 比较明文密码和哈希密码是否匹配
 * @param password 用户输入的明文密码
 * @param hash 数据库中存储的哈希密码
 * @returns 如果匹配则返回 true，否则返回 false
 */
export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
