import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "globetrotter-dev-secret";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
