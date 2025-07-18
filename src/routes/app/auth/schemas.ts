import {
  Type,
  Static,
  Object,
  Integer,
  String,
  Optional,
  Enum,
  Array,
  Union,
  Literal,
  Boolean,
} from '@sinclair/typebox';

export const LoginSchema = {
  tags: ['App / Auth'],
  body: Type.Object({
    initData: Type.Optional(Type.String({ minLength: 1 })),
    bypassData: Type.Optional(
      Type.Object({
        first_name: Type.String(),
        last_name: Type.String(),
        telegram_name: Type.String(),
        language_code: Type.String(),
        username: Type.String(),
        id: Type.Integer(),
      })
    ),
  }),
};
export type LoginSchemaType = {
  Body: Static<typeof LoginSchema.body>;
};

export const RegisterSchema = {
  tags: ['App / Auth'],
  body: Type.Object({
    initData: Type.String({ minLength: 1 }),
  }),
};
export type RegisterSchemaBodyType = {
  Body: Static<typeof RegisterSchema.body>;
};

export const ActivateProfileSchema = {
  tags: ['App / Profile'],
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
    paramsAge: Optional(
      Union([Literal('18-24'), Literal('25-34'), Literal('35-44'), Literal('45+')])
    ),
    paramsBustSize: Optional(
      Union([Literal('AA-A'), Literal('B-C'), Literal('D-E'), Literal('F+')])
    ),
    paramsHairColor: Optional(
      Union([Literal('blonde'), Literal('brunette'), Literal('brown-haired'), Literal('redhead')])
    ),
    paramsBodyType: Optional(Union([Literal('athletic'), Literal('curvy'), Literal('slim')])),
    photos: Optional(
      Array(
        Object({
          id: String(),
          isAvatar: Boolean(),
        }),
        { maxItems: 3 }
      )
    ),
  }),
};
export type ActivateProfileSchemaType = {
  Body: Static<typeof ActivateProfileSchema.body>;
  Params: Static<typeof ActivateProfileSchema.parameters>;
};
