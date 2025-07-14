import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials');
}

const env = {
  appConfig: {
    maxFileSize: process.env.MAX_FILE_SIZE,
    corsOrigins: process.env.CORS_ORIGINS,
    adminTokenExpirationTime: Number(process.env.ADMIN_TOKEN_EXPIRATION_TIME),
    adminRefreshTokenExpirationTime: Number(process.env.ADMIN_REFRESH_TOKEN_EXPIRATION_TIME),
    userTokenExpirationTime: Number(process.env.USER_TOKEN_EXPIRATION_TIME),
    userRefreshTokenExpirationTime: Number(process.env.USER_REFRESH_TOKEN_EXPIRATION_TIME),
  },
  supabase: {
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_ANON_KEY!,
    adminKey: process.env.SUPABASE_ROLE_KEY!,
  },
  ably: {
    token: process.env.ABLY_ROOT_TOKEN,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
  },
} as const;

export default env;
