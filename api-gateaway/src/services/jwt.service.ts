import { jwt } from "@elysiajs/jwt";
import type { JWTPayload, User } from "../types/auth.types";
import { env } from "../config/env";

const jwtInstance = jwt({
  name: "jwt",
  secret: env.JWT_SECRET,
});

export class JWTService {
  static async generateToken(user: User): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      provider: user.provider,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };

    return await jwtInstance.decorator.jwt.sign(payload);
  }

  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const payload = await jwtInstance.decorator.jwt.verify(token);

      if (!payload) {
        return null;
      }

      if (
        typeof payload === "object" &&
        "userId" in payload &&
        "email" in payload &&
        "provider" in payload
      ) {
        return {
          userId: payload.userId as string,
          email: payload.email as string,
          provider: payload.provider as "google" | "github",
          iat: payload.iat as number | undefined,
          exp: payload.exp as number | undefined,
        };
      }

      return null;
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      return null;
    }
  }

  static extractToken(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  static async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      provider: user.provider,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 jours
    };

    return await jwtInstance.decorator.jwt.sign(payload);
  }

  static decodeToken(token: string): any {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = Buffer.from(payload, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error);
      return null;
    }
  }
}
