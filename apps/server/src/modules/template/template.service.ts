import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import type { TemplateInput } from './template.model.js';

const templateInclude = {
  fields: {
    include: {
      dictionary: {
        include: {
          values: {
            orderBy: { sortOrder: 'asc' as const },
          },
        },
      },
    },
    orderBy: { order: 'asc' as const },
  },
  formulas: true,
};

export const templateService = {
  getAll: async () => {
    return prisma.template.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  getById: async (id: number) => {
    const item = await prisma.template.findUnique({
      where: { id },
      include: templateInclude,
    });

    if (!item) {
      throw new ApiError(404, 'Шаблон не найден');
    }

    return item;
  },

  create: async (payload: TemplateInput) => {
    return prisma.template.create({
      data: {
        name: payload.name,
        description: payload.description,
        fields: {
          create: payload.fields.map((field) => ({
            key: field.key,
            name: field.name,
            type: field.type,
            isRequired: field.isRequired,
            order: field.order,
            dictionaryId: field.dictionaryId ?? null,
          })),
        },
        formulas: {
          create: payload.formulas.map((formula) => ({
            name: formula.name,
            expression: formula.expression,
          })),
        },
      },
      include: templateInclude,
    });
  },

  update: async (id: number, payload: TemplateInput) => {
    await prisma.template.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new ApiError(404, 'Шаблон не найден');
    });

    return prisma.$transaction(async (tx) => {
      await tx.templateField.deleteMany({ where: { templateId: id } });
      await tx.formula.deleteMany({ where: { templateId: id } });

      return tx.template.update({
        where: { id },
        data: {
          name: payload.name,
          description: payload.description,
          fields: {
            create: payload.fields.map((field) => ({
              key: field.key,
              name: field.name,
              type: field.type,
              isRequired: field.isRequired,
              order: field.order,
              dictionaryId: field.dictionaryId ?? null,
            })),
          },
          formulas: {
            create: payload.formulas.map((formula) => ({
              name: formula.name,
              expression: formula.expression,
            })),
          },
        },
        include: templateInclude,
      });
    });
  },

  delete: async (id: number) => {
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      throw new ApiError(404, 'Шаблон не найден');
    }

    await prisma.template.delete({
      where: { id },
    });

    return { success: true };
  },
};