import { tariffs } from '../schema/tariff.js';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema/index.js';
import { config } from 'dotenv';
config();

const queryClient = postgres(process.env.DATABASE_URL!, {
  prepare: false,
});

console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);

const db = drizzle(queryClient, { schema, logger: true });

export const seedTariffs = async () => {
  try {
    const tariffsValues = [
      {
        price: 100,
        daysPeriod: 7,
      },
      {
        price: 1000,
        daysPeriod: 30,
      },
    ];

    const result = await db.insert(tariffs).values(tariffsValues).returning();

    console.log('✅ Basic tariffs added:');
    console.log(result);
    process.exit(0);

    return result;
  } catch (error) {
    console.error('❌ Failed to add basic tariffs:');
    console.error(error);
    process.exit(1);
    throw error;
  }
};

// Запуск скрипта
seedTariffs();
