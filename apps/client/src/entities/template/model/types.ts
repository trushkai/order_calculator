export type RoleMode = 'admin' | 'manager';

export type FieldType = 'number' | 'select';

export interface DictionaryValueDto {
  id: number;
  label: string;
  value: string;
  sortOrder: number;
}

export interface DictionaryDto {
  id: number;
  name: string;
  code: string;
  values: DictionaryValueDto[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFieldDto {
  id: number;
  key: string;
  name: string;
  type: FieldType;
  isRequired: boolean;
  order: number;
  dictionaryId: number | null;
  dictionary?: DictionaryDto | null;
}

export interface FormulaDto {
  id: number;
  name: string;
  expression: string;
}

export interface TemplateDto {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  fields: TemplateFieldDto[];
  formulas: FormulaDto[];
}

export interface TemplateListItemDto {
  id: number;
  name: string;
  description: string | null;
  updatedAt: string;
}

export interface DictionaryCreatePayload {
  name: string;
  code: string;
  values: Array<{
    label: string;
    value: string;
    sortOrder: number;
  }>;
}

export interface TemplateFieldPayload {
  key: string;
  name: string;
  type: FieldType;
  isRequired: boolean;
  order: number;
  dictionaryId?: number | null;
}

export interface TemplateCreatePayload {
  name: string;
  description?: string;
  fields: TemplateFieldPayload[];
  formulas: Array<{
    name: string;
    expression: string;
  }>;
}
