import { Type } from '@sinclair/typebox';

export const PaginationSchema = Type.Object({
    search: Type.Optional(Type.String()),
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    pageSize: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
    sortField: Type.Optional(Type.String()),
    sortOrder: Type.Optional(Type.Union([
        Type.Literal('asc'),
        Type.Literal('desc')
    ], { default: 'desc' }))
});
