import { Static, Object, Literal, String, Array, Integer, Optional, Enum, Union } from "@sinclair/typebox";

export const GetProfileSchema = {
  tags: ['Profile'],
  parameters: Object({
    profileId: Integer(),
  }),
}
export type GetProfileSchemaType = {
  Params: Static<typeof GetProfileSchema.parameters>;
};

export const ActivateProfileSchema = {
  tags: ['Profile'],
  parameters: Object({
    profileId: Integer(),
  }),
  body: Object({
    name: String(),
    about: Optional(String()),
    dateOfBirth: String({ format: 'date' }),
    gender: Enum({ male: 'male', female: 'female' }),
    hobbies: Optional(Array(String())),
    city: Optional(String()),
    paramsAge: Optional(Union([
      Literal('18-24'),
      Literal('25-34'),
      Literal('35-44'),
      Literal('45+'),
    ])),
    paramsBustSize: Optional(Union([
      Literal('AA-A'),
      Literal('B-C'),
      Literal('D-E'),
      Literal('F+'),
    ])),
    paramsHairColor: Optional(Union([
      Literal('blonde'),
      Literal('brunette'),
      Literal('brown-haired'),
      Literal('redhead'),
    ])),
    paramsBodyType: Optional(Union([
      Literal('athletic'),
      Literal('curvy'),
      Literal('slim'),
    ])),
    photos: Optional(
        Array(
            Object({
              url: String({ format: 'uri' }),
              order: Integer(),
            }),
            { maxItems: 3 }
        )
    ),
  })
};

export type ActivateProfileSchemaType = {
  Body: Static<typeof ActivateProfileSchema.body>;
  Params: Static<typeof ActivateProfileSchema.parameters>;
};

export const UpdateProfileSchema = {
  tags: ['Profile'],
  parameters: Object({
    profileId: Integer(),
  }),
  body: Object({
    name: Optional(String()),
    about: Optional(String()),
    dateOfBirth: Optional(String({ format: 'date' })),
    gender: Optional(Enum({ male: 'male', female: 'female' })),
    hobbies: Optional(Array(String())),
    city: Optional(String()),
    paramsAge: Optional(Union([
      Literal('18-24'),
      Literal('25-34'),
      Literal('35-44'),
      Literal('45+'),
    ])),
    paramsBustSize: Optional(Union([
      Literal('AA-A'),
      Literal('B-C'),
      Literal('D-E'),
      Literal('F+'),
    ])),
    paramsHairColor: Optional(Union([
      Literal('blonde'),
      Literal('brunette'),
      Literal('brown-haired'),
      Literal('redhead'),
    ])),
    paramsBodyType: Optional(Union([
      Literal('athletic'),
      Literal('curvy'),
      Literal('slim'),
    ])),
    photos: Optional(
        Array(
            Object({
              url: String({ format: 'uri' }),
              order: Integer(),
            }),
            { maxItems: 3 }
        )
    ),
  })
};

export type UpdateProfileSchemaType = {
  Body: Static<typeof UpdateProfileSchema.body>;
  Params: Static<typeof UpdateProfileSchema.parameters>;
};