import dotenv from 'dotenv'

dotenv.config()

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials')
}

const env = {
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
  }
} as const

export default env 