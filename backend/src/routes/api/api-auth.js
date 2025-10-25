import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDatabase } from "../../data/database.js";
import { requireAuth } from "../../middleware/auth.js";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../../utils/password-utils.js";

const router = Router();

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 3600 * 1000,
    secure: false
  });
}

/** POST /api/auth/register  body: { username, password, confirm, realname?, birthdate?, description?, avatar? } */
router.post("/register", async (req, res) => {
  const { username, password, confirm, realname, birthdate, description, avatar } = req.body || {};
  
  // 基本字段验证
  if (!username || !password || !confirm) {
    return res.status(400).json({ error: "Missing field" });
  }
  
  // 密码匹配验证
  if (password !== confirm) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  
  // 密码强度验证
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      error: "Password does not meet security requirements",
      details: passwordValidation.errors,
      suggestions: passwordValidation.suggestions
    });
  }
  
  // 用户名验证
  if (username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters long" });
  }
  if (username.length > 20) {
    return res.status(400).json({ error: "Username must be no more than 20 characters long" });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores" });
  }
  
  try {
    const db = await getDatabase();
    
    // 使用改进的密码哈希
    const hash = await hashPassword(password);
    
    await db.run(
      `INSERT INTO Users (username, passwordHash, realname, birthdate, description, avatarUrl)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hash, realname || "", birthdate || "", description || "", avatar || ""]
    );
    
    console.log(`New user registered: ${username}`);
    return res.status(201).json({ 
      message: "Registration successful",
      passwordStrength: passwordValidation.strength
    });
  } catch (e) {
    if (String(e).includes("UNIQUE")) {
      return res.status(409).json({ error: "Username already taken" });
    }
    console.error('Registration error:', e);
    return res.status(500).json({ error: "Server error" });
  }
});

/** GET /api/auth/registered?username=xxx → { registered: true/false } */
router.get("/registered", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Missing username" });
  
  try {
    const db = await getDatabase();
    const row = await db.get("SELECT 1 FROM Users WHERE username = ?", [username]);
    return res.json({ registered: !!row });
  } catch (error) {
    console.error('Username check error:', error);
    return res.status(500).json({ error: "Server error" });
  }
});

/** POST /api/auth/login  body: { username, password } → set Cookie and return basic user */
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing field" });

  try {
    const db = await getDatabase();
    const user = await db.get(
      "SELECT id, username, passwordHash, admin FROM Users WHERE username = ?",
      [username]
    );
    
    if (!user) {
      console.log(`Login attempt with non-existent username: ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 使用改进的密码验证
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      console.log(`Failed login attempt for user: ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        admin: user.admin || false
      },
      process.env.JWT_SECRET || "dev",
      { expiresIn: "7d" }
    );
    
    setAuthCookie(res, token);
    
    console.log(`Successful login for user: ${username}`);
    return res.json({ 
      message: "Login successful", 
      user: { 
        id: user.id, 
        username: user.username,
        admin: user.admin || false
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: "Server error" });
  }
});

/** POST /api/auth/logout → clear Cookie */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logout successful" });
});

/** GET /api/auth/userInfo → return current user */
router.get('/userInfo', requireAuth, (req, res) => {
  console.log('userInfo hit, req.user =', req.user);
  res.set('Cache-Control', 'no-store');
  return res.json({ user: req.user });
});

export default router;



