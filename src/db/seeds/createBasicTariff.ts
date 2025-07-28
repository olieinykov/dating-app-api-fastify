import { tariffs } from '../schema/tariff.js';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema/index.js';

const queryClient = postgres(process.env.DATABASE_URL!, {
  prepare: false,
});

const db = drizzle(queryClient, { schema, logger: true });

async function createBasicTariff() {
  // try {
  //   await db.insert(tariffs).values({
  //     name: 'Basic',
  //     price: 0,
  //     description: 'Default free plan',
  //     entriesDailyLimit: 20,
  //     isDefault: true,
  //   });
  //
  //   console.log('✓ Basic tariff created/updated');
  // } catch (e) {
  //   console.error('Error seeding tariff:', e);
  //   process.exit(1);
  // } finally {
  //   await queryClient.end();
  // }
}

createBasicTariff();
