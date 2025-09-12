import { pgTable, serial, text, timestamp, pgEnum, date, json, integer } from 'drizzle-orm/pg-core';
import { profiles } from './profile';
import { tariffs } from './tariff';

export const genderEnum = pgEnum('gender', ['male', 'female']);
export const paramsAgeEnum = pgEnum('params_age', ['18-24', '25-34', '35-44', '45+']);
export const paramsBustSizeEnum = pgEnum('params_bust_size', ['AA-A', 'B-C', 'D-E', 'F+']);
export const paramsHairColorEnum = pgEnum('params_hair_color', [
  'blonde',
  'brunette',
  'brown-haired',
  'redhead',
]);
export const paramsBodyTypeEnum = pgEnum('params_body_type', ['athletic', 'curvy', 'slim']);

// Use them in the table
export const profilesPreferences = pgTable('profiles_preferences', {
  id: serial('id').primaryKey(),
  profileId: serial('profile_id').references(() => profiles.id, { onDelete: 'cascade' }),
  about: text('about'),
  dateOfBirth: date('date_of_birth'),
  gender: genderEnum('gender'),
  hobbies: json('hobbies').$type<string[]>(),
  city: text('city'),
  country: text('country'),
  paramsAge: paramsAgeEnum('params_age'),
  paramsBustSize: paramsBustSizeEnum('params_bust_size'),
  paramsHairColor: paramsHairColorEnum('params_hair_color'),
  paramsBodyType: paramsBodyTypeEnum('params_body_type'),
  tariffId: integer('tariff_id').references(() => tariffs.id),
  entriesSentToday: integer('entries_sent_today').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
