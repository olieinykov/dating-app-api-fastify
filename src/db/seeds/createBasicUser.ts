import {supabaseAdmin} from "../../services/supabase";
import {profiles} from "../schema";
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

export const seedRootUser = async () => {
    try {
        const payload = {
            email: "superadmin@gmail.com",
            password: "123456789!",
            name: "Admin",
            role: "admin"
        };

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: payload.email,
            password: payload.password,
            email_confirm: true,
            user_metadata: {
                role: payload.role,
            },
        });

        if (authError) {
            console.error('❌ Failed to create root user:');
            console.error(authError);
            process.exit(1);
        }

        const result = await db.transaction(async (tx) => {
            const [createdUser] = await tx
                .insert(profiles)
                .values({
                    ...payload,
                    userId: authData.user?.id,
                })
                .returning();
            return createdUser;
        });

        console.log('✅ Root user created:');
        console.log(result);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create root user:');
        console.error(error);
        process.exit(1);
    }
};

seedRootUser();
