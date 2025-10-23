// auth middleware: read and verify JWT from cookies
import jwt from "jsonwebtoken";

// Login required: put { id, userName } into req.user, otherwise return 401.

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "未登录" });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");
    req.user = payload; // { id, userName }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }
}
