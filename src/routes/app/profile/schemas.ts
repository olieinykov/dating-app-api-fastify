import {
  Static,
  Object,
  Literal,
  String,
  Array,
  Boolean,
  Optional,
  Enum,
  Union,
} from '@sinclair/typebox';

export const GetProfileSchema = {
  tags: ['App / Profile'],
};

export const UpdateProfileSchema = {
  tags: ['App / Profile'],
  body: Object({
    name: Optional(String()),
    about: Optional(String()),
    dateOfBirth: Optional(String({ format: 'date' })),
    gender: Optional(Enum({ male: 'male', female: 'female' })),
    hobbies: Optional(Array(String())),
    city: Optional(String()),
    country: Optional(String()),
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

export type UpdateProfileSchemaType = {
  Body: Static<typeof UpdateProfileSchema.body>;
};
