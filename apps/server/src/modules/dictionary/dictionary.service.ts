import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import type { DictionaryInput } from './dictionary.model.js';

export const dictionaryService = {
  getAll: async () => {
    return prisma.dictionary.findMany({
      include: {
        values: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  getById: async (id: number) => {
    const item = await prisma.dictionary.findUnique({
      where: { id },
      include: {
        values: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!item) {
      throw new ApiError(404, 'Справочник не найден');
    }

    return item;
  },

  create: async (payload: DictionaryInput) => {
    return prisma.dictionary.create({
      data: {
        name: payload.name,
        code: payload.code,
        values: {
          create: payload.values.map((value) => ({
            label: value.label,
            value: value.value,
            sortOrder: value.sortOrder,
          })),
        },
      },
      include: {
        values: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  },

  update: async (id: number, payload: DictionaryInput) => {
    await prisma.dictionary.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new ApiError(404, 'Справочник не найден');
    });

    return prisma.$transaction(async (tx) => {
      await tx.dictionaryValue.deleteMany({ where: { dictionaryId: id } });

      return tx.dictionary.update({
        where: { id },
        data: {
          name: payload.name,
          code: payload.code,
          values: {
            create: payload.values.map((value) => ({
              label: value.label,
              value: value.value,
              sortOrder: value.sortOrder,
            })),
          },
        },
        include: {
          values: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    });
  },

  delete: async (id: number) => {
    const dictionary = await prisma.dictionary.findUnique({
      where: { id },
      include: {
        fields: true,
      },
    });

    if (!dictionary) {
      throw new ApiError(404, 'Справочник не найден');
    }

    if (dictionary.fields.length > 0) {
      throw new ApiError(
        409,
        'Нельзя удалить справочник, потому что он используется в шаблонах',
      );
    }

    await prisma.dictionary.delete({
      where: { id },
    });

    return { success: true };
  },
};