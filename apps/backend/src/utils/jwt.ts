import { JsonWebTokenError, sign, verify } from "jsonwebtoken";
import { JWT_KEY } from "../utils/env";

interface Payload {
  id: string;
  email: string;
}

export function generateToken(payload: Payload): string {
  return sign(payload, JWT_KEY, { expiresIn: "1d" });
}

export function verifyToken(token: string): Payload | JsonWebTokenError {
  try {
    return verify(token, JWT_KEY) as Payload;
  } catch (error) {
    return error instanceof JsonWebTokenError
      ? error
      : new JsonWebTokenError("Failed to verify token");
  }
}
