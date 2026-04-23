import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { calculatorApi } from '@/shared/api/calculatorApi';
import { FormulaEditorWidget } from '@/widgets/formula-editor/ui/FormulaEditorWidget';
import { createFieldKey } from '@/shared/lib/formula';
import { useRoleStore } from '@/features/template-builder/model/useRoleStore';
import type {
  DictionaryDto,
  TemplateCreatePayload,
  TemplateDto,
  TemplateFieldPayload,
  TemplateListItemDto,
} from '@/entities/template/model/types';

interface TemplateFormValues {
  name: string;
  description?: string;
  fields: Array<{
    key: string;
    name: string;
    type: 'number' | 'select';
    isRequired: boolean;
    order: number;
    dictionaryId?: number | null;
  }>;
  formulaName: string;
  expression: string;
}

export const TemplatesPage = () => {
  const { role } = useRoleStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<TemplateFormValues>();
  const [templates, setTemplates] = useState<TemplateListItemDto[]>([]);
  const [dictionaries, setDictionaries] = useState<DictionaryDto[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDto | null>(null);
  const [loading, setLoading] = useState(false);

  const watchedFields = Form.useWatch('fields', form) ?? [];
  const watchedExpression = Form.useWatch('expression', form) ?? '';

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [templatesData, dictionariesData] = await Promise.all([
        calculatorApi.getTemplates(),
        calculatorApi.getDictionaries(),
      ]);
      setTemplates(templatesData);
      setDictionaries(dictionariesData);
    } catch {
      messageApi.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInitial();

    form.setFieldsValue({
      name: '',
      description: '',
      formulaName: 'Итого',
      expression: '',
      fields: [],
    });
  }, [form]);

  const resetForm = () => {
    setSelectedTemplate(null);

    form.setFieldsValue({
      name: '',
      description: '',
      formulaName: 'Итого',
      expression: '',
      fields: [],
    });
  };

  const handleEdit = async (id: number) => {
    try {
      const data = await calculatorApi.getTemplateById(id);
      setSelectedTemplate(data);

      form.setFieldsValue({
        name: data.name,
        description: data.description ?? '',
        formulaName: data.formulas[0]?.name ?? 'Итого',
        expression: data.formulas[0]?.expression ?? '',
        fields: data.fields.map((field) => ({
          key: field.key,
          name: field.name,
          type: field.type,
          isRequired: field.isRequired,
          order: field.order,
          dictionaryId: field.dictionaryId,
        })),
      });
    } catch {
      messageApi.error('Не удалось открыть шаблон');
    }
  };

  const handleDelete = (item: TemplateListItemDto) => {
    Modal.confirm({
      title: 'Удалить шаблон?',
      content: `Шаблон «${item.name}» будет удален без возможности восстановления.`,
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await calculatorApi.deleteTemplate(item.id);

          if (selectedTemplate?.id === item.id) {
            resetForm();
          }

          messageApi.success('Шаблон удален');
          await fetchInitial();
        } catch (error) {
          if (axios.isAxiosError(error)) {
            messageApi.error(error.response?.data?.message ?? 'Не удалось удалить шаблон');
          } else {
            messageApi.error('Не удалось удалить шаблон');
          }
        }
      },
    });
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();

      const fields: TemplateFieldPayload[] = values.fields.map((field, index) => ({
        key: field.key || createFieldKey(field.name),
        name: field.name,
        type: field.type,
        isRequired: Boolean(field.isRequired),
        order: index,
        dictionaryId: field.type === 'select' ? field.dictionaryId ?? null : null,
      }));

      const payload: TemplateCreatePayload = {
        name: values.name,
        description: values.description,
        fields,
        formulas: [
          {
            name: values.formulaName || 'Итого',
            expression: values.expression,
          },
        ],
      };

      if (selectedTemplate) {
        await calculatorApi.updateTemplate(selectedTemplate.id, payload);
        messageApi.success('Шаблон обновлен');
      } else {
        await calculatorApi.createTemplate(payload);
        messageApi.success('Шаблон создан');
      }

      await fetchInitial();
      resetForm();
    } catch (error) {
      const validationError = error as { errorFields?: unknown[] };

      if (validationError?.errorFields?.length) {
        messageApi.error('Заполните обязательные поля и формулу');
        return;
      }

      if (axios.isAxiosError(error)) {
        messageApi.error(error.response?.data?.message ?? 'Не удалось сохранить шаблон');
      } else {
        messageApi.error('Не удалось сохранить шаблон');
      }
    }
  };

  const previewColumns = useMemo(
    () => [
      {
        title: 'Название',
        dataIndex: 'name',
        render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
      },
      { title: 'Ключ', dataIndex: 'key', render: (value: string) => <Tag>{value}</Tag> },
      { title: 'Тип', dataIndex: 'type', render: (value: string) => <Tag color="blue">{value}</Tag> },
      {
        title: 'Обязательное',
        dataIndex: 'isRequired',
        render: (value: boolean) => (value ? <Tag color="green">Да</Tag> : <Tag>Нет</Tag>),
      },
    ],
    [],
  );

  if (role !== 'admin') {
    return (
      <Card className="page-card">
        <Typography.Title level={4}>Конструктор шаблонов</Typography.Title>
        <Typography.Text>Модуль доступен только в режиме администратора.</Typography.Text>
      </Card>
    );
  }

  return (
    <>
      {contextHolder}

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card className="page-card page-hero-card">
          <div className="page-hero-grid">
            <div>
              <Typography.Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
                Конструктор шаблонов
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Создавайте калькуляторы из динамических полей, привязывайте справочники и собирайте формулы
                через ключи.
              </Typography.Paragraph>
            </div>

            <div className="hero-metric-box">
              <div className="hero-metric-value">{templates.length}</div>
              <div className="hero-metric-label">Готовых шаблонов</div>
            </div>
          </div>
        </Card>

        <div className="grid-two">
          <Card
            className="page-card"
            loading={loading}
            title="Готовые шаблоны"
            extra={<Button onClick={resetForm}>Новый</Button>}
          >
            <List
              dataSource={templates}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key={`open_${item.id}`} type="link" onClick={() => void handleEdit(item.id)}>
                      Открыть
                    </Button>,
                    <Button key={`delete_${item.id}`} type="link" danger onClick={() => handleDelete(item)}>
                      Удалить
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className="list-item-title-wrap">
                        <span>{item.name}</span>
                      </div>
                    }
                    description={item.description || 'Без описания'}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
              className="page-card"
              title={selectedTemplate ? 'Редактирование шаблона' : 'Новый шаблон'}
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  name="name"
                  label="Название калькулятора"
                  rules={[{ required: true, message: 'Введите название' }]}
                >
                  <Input placeholder="Например, Расчет логистики" />
                </Form.Item>

                <Form.Item name="description" label="Описание">
                  <Input.TextArea rows={3} placeholder="Короткое описание шаблона" />
                </Form.Item>

                <Typography.Title level={5}>Поля шаблона</Typography.Title>

                <Form.List name="fields">
                  {(fields, { add, remove }) => (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {fields.map((field) => {
                        const type = form.getFieldValue(['fields', field.name, 'type']);

                        return (
                          <Card key={field.key} size="small" className="nested-soft-card">
                            <div className="grid-two">
                              <Form.Item
                                {...field}
                                name={[field.name, 'name']}
                                label="Название поля"
                                rules={[{ required: true, message: 'Введите название поля' }]}
                              >
                                <Input
                                  placeholder="Например, Вес груза"
                                  onBlur={(event) => {
                                    const currentKey = form.getFieldValue(['fields', field.name, 'key']);
                                    if (!currentKey) {
                                      form.setFieldValue(
                                        ['fields', field.name, 'key'],
                                        createFieldKey(event.target.value),
                                      );
                                    }
                                  }}
                                />
                              </Form.Item>

                              <Form.Item
                                {...field}
                                name={[field.name, 'key']}
                                label="Ключ формулы"
                                rules={[{ required: true, message: 'Введите ключ' }]}
                              >
                                <Input placeholder="weight" />
                              </Form.Item>
                            </div>

                            <div className="grid-two">
                              <Form.Item
                                {...field}
                                name={[field.name, 'type']}
                                label="Тип"
                                rules={[{ required: true, message: 'Выберите тип' }]}
                              >
                                <Select
                                  options={[
                                    { label: 'Число', value: 'number' },
                                    { label: 'Выпадающий список', value: 'select' },
                                  ]}
                                />
                              </Form.Item>

                              <Form.Item {...field} name={[field.name, 'order']} label="Порядок">
                                <InputNumber min={0} style={{ width: '100%' }} />
                              </Form.Item>
                            </div>

                            <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
                              <Form.Item
                                {...field}
                                name={[field.name, 'isRequired']}
                                valuePropName="checked"
                                style={{ marginBottom: 0 }}
                              >
                                <Checkbox>Обязательное поле</Checkbox>
                              </Form.Item>

                              {type === 'select' && (
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'dictionaryId']}
                                  label="Справочник"
                                  style={{ width: 280, marginBottom: 0 }}
                                  rules={[{ required: true, message: 'Выберите справочник' }]}
                                >
                                  <Select
                                    placeholder="Выберите справочник"
                                    options={dictionaries.map((item) => ({
                                      label: item.name,
                                      value: item.id,
                                    }))}
                                  />
                                </Form.Item>
                              )}

                              <Button danger onClick={() => remove(field.name)}>
                                Удалить поле
                              </Button>
                            </Space>
                          </Card>
                        );
                      })}

                      <Button
                        onClick={() =>
                          add({
                            key: '',
                            name: '',
                            type: 'number',
                            isRequired: true,
                            order: fields.length,
                            dictionaryId: null,
                          })
                        }
                      >
                        Добавить поле
                      </Button>
                    </Space>
                  )}
                </Form.List>

                <Form.Item
                  name="formulaName"
                  label="Название результата"
                  initialValue="Итого"
                  style={{ marginTop: 24 }}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="expression"
                  hidden
                  rules={[{ required: true, message: 'Введите формулу' }]}
                >
                  <Input />
                </Form.Item>
              </Form>
            </Card>

            <FormulaEditorWidget
              value={watchedExpression}
              onChange={(value) => form.setFieldValue('expression', value)}
              fields={watchedFields}
            />

            <Card className="page-card" title="Предпросмотр структуры">
              <Table
                rowKey={(record, index) => record.key || record.name || `row_${index ?? 0}`}
                dataSource={watchedFields}
                columns={previewColumns}
                pagination={false}
              />

              <div className="formula-preview-box" style={{ marginTop: 18 }}>
                <Typography.Text strong>Выражение:</Typography.Text>
                <div className="formula-preview-code">{watchedExpression || '—'}</div>
              </div>
            </Card>

            <Space>
              <Button type="primary" onClick={() => void submit()}>
                Сохранить шаблон
              </Button>
              <Button onClick={resetForm}>Очистить форму</Button>
            </Space>
          </Space>
        </div>
      </Space>
    </>
  );
};