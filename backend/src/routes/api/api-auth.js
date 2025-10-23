import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDatabase } from "../../data/database.js";
import { requireAuth } from "../../middleware/auth.js";

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
  if (!username || !password || !confirm) {
    return res.status(400).json({ error: "Missing field" });
  }
  if (password !== confirm) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  try {
    const db = await getDatabase();
    const hash = await bcrypt.hash(password, 10);
    await db.run(
      `INSERT INTO users (username, passwordHash, realname, birthdate, description, avatarUrl)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hash, realname || "", birthdate || "", description || "", avatar || ""]
    );
    return res.status(201).json({ message: "Registration successful" });
  } catch (e) {
    if (String(e).includes("UNIQUE")) {
      return res.status(409).json({ error: "Username already taken" });
    }
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

/** GET /api/auth/registered?username=xxx → { registered: true/false } */
router.get("/registered", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Missing username" });
  const db = await getDatabase();
  const row = await db.get("SELECT 1 FROM users WHERE username = ?", [username]);
  return res.json({ registered: !!row });
});

/** POST /api/auth/login  body: { username, password } → set Cookie and return basic user */
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing field" });

  const db = await getDatabase();
  const user = await db.get(
    "SELECT id, username, passwordHash FROM Users WHERE username = ?",
    [username]
  );
  if (!user) return res.status(401).json({ error: "User not found" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Incorrect password" });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || "dev",
    { expiresIn: "7d" }
  );
  setAuthCookie(res, token);

  return res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
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



