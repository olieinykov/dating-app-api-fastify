import { tariffs } from '../schema/tariff';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema/index.js';

const queryClient = postgres("postgresql://postgres.angrparasmsncbnmgecm:fpl2BzEQAMAsbOap@aws-0-eu-north-1.pooler.supabase.com:6543/postgres", {
    prepare: false,
});

const db = drizzle(queryClient, { schema, logger: true });

async function createBasicTariff() {
  try {
    await db.insert(tariffs).values({
      name: "Basic",
      price: 0,
      description: "Default free plan",
      entriesDailyLimit: 20,
      isDefault: true,
    });

    console.log("✓ Basic tariff created/updated");
  } catch (e) {
    console.error("Error seeding tariff:", e);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

createBasicTariff();