import { http } from '@/shared/api/http';
import type {
  DictionaryCreatePayload,
  DictionaryDto,
  TemplateCreatePayload,
  TemplateDto,
  TemplateListItemDto,
} from '@/entities/template/model/types';

export const calculatorApi = {
  getTemplates: async () => {
    const { data } = await http.get<TemplateListItemDto[]>('/templates');
    return data;
  },

  getTemplateById: async (id: number) => {
    const { data } = await http.get<TemplateDto>(`/templates/${id}`);
    return data;
  },

  createTemplate: async (payload: TemplateCreatePayload) => {
    const { data } = await http.post<TemplateDto>('/templates', payload);
    return data;
  },

  updateTemplate: async (id: number, payload: TemplateCreatePayload) => {
    const { data } = await http.put<TemplateDto>(`/templates/${id}`, payload);
    return data;
  },

  deleteTemplate: async (id: number) => {
    const { data } = await http.delete<{ success: boolean }>(`/templates/${id}`);
    return data;
  },

  getDictionaries: async () => {
    const { data } = await http.get<DictionaryDto[]>('/dictionaries');
    return data;
  },

  getDictionaryById: async (id: number) => {
    const { data } = await http.get<DictionaryDto>(`/dictionaries/${id}`);
    return data;
  },

  createDictionary: async (payload: DictionaryCreatePayload) => {
    const { data } = await http.post<DictionaryDto>('/dictionaries', payload);
    return data;
  },

  updateDictionary: async (id: number, payload: DictionaryCreatePayload) => {
    const { data } = await http.put<DictionaryDto>(`/dictionaries/${id}`, payload);
    return data;
  },

  deleteDictionary: async (id: number) => {
    const { data } = await http.delete<{ success: boolean }>(`/dictionaries/${id}`);
    return data;
  },
};