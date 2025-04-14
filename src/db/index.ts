import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index'; // путь к твоим таблицам, например profiles

const queryClient = postgres(process.env.DATABASE_URL!); // добавь "!" если уверен, что env точно есть

export const db = drizzle(queryClient, { schema });