import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_MIN = parseInt(process.env.JWT_EXPIRES_MIN || "120");

if (!JWT_SECRET || JWT_SECRET === "CAMBIA_ESTA_CLAVE") {
  console.error("JWT_SECRET environment variable must be set with a secure value");
  process.exit(1);
}

export function signToken({ matricula, email }) {
  return jwt.sign(
    { sub: matricula, email },
    JWT_SECRET,
    { expiresIn: `${JWT_EXPIRES_MIN}m` }
  );
}

export function authMiddleware(req, res, next) {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { matricula: payload.sub, email: payload.email };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}
