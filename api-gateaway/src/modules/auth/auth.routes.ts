import { Elysia } from "elysia";
import { oauth2 } from "elysia-oauth2";
import { env } from "../../config/env";
import { UserService } from "../../services/user.service";
import { JWTService } from "../../services/jwt.service";
import type { GoogleProfile, GitHubProfile } from "../../types/auth.types";

export const authRouter = new Elysia({
  name: "api.auth",
  prefix: "/auth",
})
  .get("/", () => {
    return {
      message: "API Authentification OAuth",
      providers: ["google", "github"],
      endpoints: {
        google: {
          login: "/auth/google",
          callback: "/auth/google/callback",
        },
        github: {
          login: "/auth/github",
          callback: "/auth/github/callback",
        },
      },
    };
  })

  .use(
    oauth2({
      Google: [
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REDIRECT_URI,
      ],
      GitHub: [
        env.GITHUB_CLIENT_ID,
        env.GITHUB_CLIENT_SECRET,
        env.GITHUB_REDIRECT_URI,
      ],
    }),
  )

  .get("/google", async ({ oauth2 }) => {
    return oauth2.redirect("Google", ["openid", "email", "profile"]);
  })

  .get("/google/callback", async ({ oauth2, redirect }) => {
    try {

      const tokens = await oauth2.authorize("Google");
      const accessToken = tokens.accessToken();
      console.log("✅ Tokens Google");

      const profileResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!profileResponse.ok) {
        throw new Error("Impossible de récupérer le profil Google");
      }

      const profile: GoogleProfile = await profileResponse.json();
      console.log(`✅ Profil Google: ${profile.email}`);

      const user = UserService.createFromGoogleProfile(profile);

      const token = await JWTService.generateToken(user);

      const frontendUrl = new URL(env.FRONTEND_URL);
      frontendUrl.searchParams.set("token", token);
      frontendUrl.searchParams.set("provider", "google");

      return redirect(frontendUrl.toString());
    } catch (error) {
      console.error("❌ Erreur lors de l'authentification Google:", error);

      const errorUrl = new URL(env.FRONTEND_URL);
      errorUrl.searchParams.set("error", "google_auth_failed");
      errorUrl.searchParams.set(
        "message",
        error instanceof Error ? error.message : "Authentication failed",
      );

      return redirect(errorUrl.toString());
    }
  })

  .get("/github", async ({ oauth2 }) => {
    return oauth2.redirect("GitHub", ["read:user", "user:email"]);
  })

  .get("/github/callback", async ({ oauth2, redirect }) => {
    try {

      const tokens = await oauth2.authorize("GitHub");
      const accessToken = tokens.accessToken();

      const profileResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "User-Agent": "Elysia-OAuth-App",
        },
      });

      if (!profileResponse.ok) {
        throw new Error("Impossible de récupérer le profil GitHub");
      }

      const profile: GitHubProfile = await profileResponse.json();

      if (!profile.email) {
        const emailsResponse = await fetch(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
              "User-Agent": "Elysia-OAuth-App",
            },
          },
        );

        if (emailsResponse.ok) {
          const emails: Array<{
            email: string;
            primary: boolean;
            verified: boolean;
          }> = await emailsResponse.json();
          const primaryEmail = emails.find((e) => e.primary && e.verified);
          if (primaryEmail) {
            profile.email = primaryEmail.email;
          }
        }
      }

      if (!profile.email) {
        throw new Error("Aucun email trouvé pour ce compte GitHub");
      }

      console.log(`✅ GitHub Profile : ${profile.email}`);

      const user = UserService.createFromGitHubProfile(profile);

      const token = await JWTService.generateToken(user);

      const frontendUrl = new URL(env.FRONTEND_URL);
      frontendUrl.searchParams.set("token", token);
      frontendUrl.searchParams.set("provider", "github");

      return redirect(frontendUrl.toString());
    } catch (error) {
      console.error("❌ Erreur lors de l'authentification GitHub:", error);

      const errorUrl = new URL(env.FRONTEND_URL);
      errorUrl.searchParams.set("error", "github_auth_failed");
      errorUrl.searchParams.set(
        "message",
        error instanceof Error ? error.message : "Authentication failed",
      );

      return redirect(errorUrl.toString());
    }
  })

  .get("/verify", async ({ headers }) => {
    const token = JWTService.extractToken(headers.authorization);

    if (!token) {
      return {
        valid: false,
        error: "No token provided",
      };
    }

    const payload = await JWTService.verifyToken(token);

    if (!payload) {
      return {
        valid: false,
        error: "Invalid token",
      };
    }

    const user = UserService.findById(payload.userId);

    if (!user) {
      return {
        valid: false,
        error: "User not found",
      };
    }

    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
      },
    };
  })

  .get("/me", async ({ headers }) => {
    const token = JWTService.extractToken(headers.authorization);

    if (!token) {
      return {
        success: false,
        error: "No token provided",
      };
    }

    const payload = await JWTService.verifyToken(token);

    if (!payload) {
      return {
        success: false,
        error: "Invalid token",
      };
    }

    const user = UserService.findById(payload.userId);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        createdAt: user.createdAt,
      },
    };
  })

  .post("/logout", () => {
    return {
      success: true,
      message: "Logged out successfully",
    };
  })

  .get("/users", () => {
    return {
      count: UserService.count(),
      users: UserService.listAll(),
    };
  });
