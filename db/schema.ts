import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const notes=sqliteTable('shirube_notes',{userId:text('user_id').notNull(),id:text('id').notNull(),payload:text('payload').notNull(),version:integer('version').notNull().default(1),updatedAt:text('updated_at').notNull()},t=>[primaryKey({columns:[t.userId,t.id]})]);
