import bcrypt from "bcrypt";

/**
 * 密码哈希工具类
 * 提供更强的密码安全功能
 */

// 配置参数
const BCRYPT_ROUNDS = 12; // 增加工作因子，提高安全性
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

/**
 * 简化的密码验证 - 只检查长度
 * @param {string} password - 密码
 * @returns {Object} - 验证结果
 */
export function validatePasswordStrength(password) {
  const errors = [];

  // 只检查长度
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Password must be no more than ${MAX_PASSWORD_LENGTH} characters long`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions: [],
    strength: "valid",
    score: 1
  };
}

/**
 * 哈希密码
 * @param {string} password - 原始密码
 * @returns {Promise<string>} - 哈希后的密码
 */
export async function hashPassword(password) {
  try {
    // 验证密码强度
    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    // 生成盐并哈希密码
    const saltRounds = BCRYPT_ROUNDS;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log(`Password hashed with ${saltRounds} rounds`);
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * 验证密码
 * @param {string} password - 原始密码
 * @param {string} hashedPassword - 哈希后的密码
 * @returns {Promise<boolean>} - 验证结果
 */
export async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * 生成密码提示
 * @param {string} password - 密码
 * @returns {Array} - 提示数组
 */
export function generatePasswordHints(password) {
  const hints = [];
  
  if (password.length < 8) {
    hints.push("Use at least 8 characters");
  }
  if (!/(?=.*[a-z])/.test(password)) {
    hints.push("Add lowercase letters");
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    hints.push("Add uppercase letters");
  }
  if (!/(?=.*\d)/.test(password)) {
    hints.push("Add numbers");
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    hints.push("Add special characters");
  }
  
  return hints;
}
