import { Elysia } from "elysia";
import { authRouter } from "./modules/auth/auth.routes";
import { env, validateEnv } from "./config/env";

validateEnv();

const app = new Elysia()
  .onRequest(({ request, set }) => {
    set.headers["Access-Control-Allow-Origin"] = env.FRONTEND_URL;
    set.headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, DELETE, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    set.headers["Access-Control-Allow-Credentials"] = "true";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
  })

  .get("/", () => ({
    message: "🦊 API Gateway with OAuth",
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
      health: "/health",
    },
    documentation: "Visitez /auth pour voir les endpoints d'authentification",
  }))

  .get("/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))

  .use(authRouter)

  .onError(({ error, code, set }) => {
    console.error(`❌ Erreur [${code}]:`, error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        error: "Route not found",
        message: "The requested endpoint does not exist",
      };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        error: "Validation error",
        message: errorMessage,
      };
    }

    if (code === "INTERNAL_SERVER_ERROR") {
      set.status = 500;
      return {
        success: false,
        error: "Internal server error",
        message:
          env.NODE_ENV === "development"
            ? errorMessage
            : "An unexpected error occurred",
      };
    }

    set.status = 500;
    return {
      success: false,
      error: "Unknown error",
      message:
        env.NODE_ENV === "development"
          ? errorMessage
          : "An unexpected error occurred",
    };
  })

  .listen(parseInt(env.PORT));

console.log(`
🦊 Elysia API Gateway is running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server: http://${app.server?.hostname}:${app.server?.port}
🔐 Auth:   http://${app.server?.hostname}:${app.server?.port}/auth
💚 Health: http://${app.server?.hostname}:${app.server?.port}/health

OAuth Providers:
  🔵 Google: /auth/google
  🟣 GitHub: /auth/github

Environment: ${env.NODE_ENV}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
