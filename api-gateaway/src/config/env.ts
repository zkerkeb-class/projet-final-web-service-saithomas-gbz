export const env = {
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_SKOLAR_URL_GATEAWAY: process.env.APP_SKOLAR_URL_GATEAWAY || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback',
} as const;

export function validateEnv() {
  const requiredVars = [
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
  ];

  const missing = requiredVars.filter(
    (varName) => !env[varName as keyof typeof env] || env[varName as keyof typeof env] === ''
  );

  if (missing.length > 0 && env.NODE_ENV === 'production') {
    throw new Error(
      `Environment Variable missing : ${missing.join(', ')}`
    );
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing Env variable: ${missing.join(', ')}\n` +
      `   OAuth will not work correctly without these variables`
    );
  }
}
