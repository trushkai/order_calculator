import { z } from 'zod';

export const dictionaryValueSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  sortOrder: z.number().int().min(0).default(0),
});

export const dictionarySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  values: z.array(dictionaryValueSchema).min(1),
});

export type DictionaryInput = z.infer<typeof dictionarySchema>;
