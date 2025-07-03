import { pgEnum } from "drizzle-orm/pg-core";

export const actionTypeEnum = pgEnum('action_type', ['create', 'edit', 'delete']);
