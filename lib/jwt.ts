import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.AUTH_SECRET || "hermione_secret_key_fallback_123"

export function signToken(payload: object, expiresIn: string | number = "30d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
  } catch (error) {
    return null
  }
}
