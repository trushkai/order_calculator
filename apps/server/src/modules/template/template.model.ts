import { z } from 'zod';

export const templateFieldSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['number', 'select']),
  isRequired: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  dictionaryId: z.number().int().nullable().optional(),
});

export const formulaSchema = z.object({
  name: z.string().min(1),
  expression: z.string().min(1),
});

export const templateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  fields: z.array(templateFieldSchema).min(1),
  formulas: z.array(formulaSchema).min(1),
});

export type TemplateInput = z.infer<typeof templateSchema>;
