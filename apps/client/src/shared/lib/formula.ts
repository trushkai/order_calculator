import { create, all } from 'mathjs';
import type { TemplateDto } from '@/entities/template/model/types';

const math = create(all, {});

const allowedExpression = /^[0-9+\-*/().,\s#{}A-Za-z_]+$/;

export const buildFormulaPreview = (expression: string, fieldMap: Record<string, string>) => {
  return expression.replace(/#\{([A-Za-z0-9_]+)\}/g, (_, key: string) => fieldMap[key] ?? `#{${key}}`);
};

export const evaluateTemplateFormula = (
  template: TemplateDto | null,
  formValues: Record<string, unknown>,
): number | null => {
  if (!template?.formulas?.length) {
    return null;
  }

  const expression = template.formulas[0].expression;

  if (!allowedExpression.test(expression)) {
    return null;
  }

  const scope = template.fields.reduce<Record<string, number>>((acc, field) => {
    const rawValue = formValues[field.key];

    if (field.type === 'number') {
      acc[field.key] = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0);
      return acc;
    }

    if (field.type === 'select' && field.dictionary?.values?.length) {
      const selected = field.dictionary.values.find((item) => item.value === rawValue);
      acc[field.key] = selected ? Number(selected.value) || 0 : Number(rawValue ?? 0);
      return acc;
    }

    acc[field.key] = Number(rawValue ?? 0);
    return acc;
  }, {});

  const normalized = expression.replace(/#\{([A-Za-z0-9_]+)\}/g, '$1');

  try {
    const result = math.evaluate(normalized, scope);

    if (typeof result !== 'number' || Number.isNaN(result) || !Number.isFinite(result)) {
      return null;
    }

    return Number(result.toFixed(2));
  } catch {
    return null;
  }
};

export const createFieldKey = (value: string) => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-я0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');

  return slug || `field_${Date.now()}`;
};
