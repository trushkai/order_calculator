import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Empty,
  Form,
  InputNumber,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { calculatorApi } from '@/shared/api/calculatorApi';
import { evaluateTemplateFormula } from '@/shared/lib/formula';
import type { TemplateDto, TemplateListItemDto } from '@/entities/template/model/types';

export const CalculatorPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<Record<string, unknown>>();
  const [templates, setTemplates] = useState<TemplateListItemDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [template, setTemplate] = useState<TemplateDto | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const watchedValues = Form.useWatch([], form);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await calculatorApi.getTemplates();
        setTemplates(data);
      } catch {
        messageApi.error('Не удалось загрузить шаблоны');
      }
    };

    void loadTemplates();
  }, [messageApi]);

  useEffect(() => {
    const nextResult = evaluateTemplateFormula(template, watchedValues ?? {});
    setResult(nextResult);
  }, [template, watchedValues]);

  const handleSelect = async (id: number) => {
    setSelectedId(id);
    form.resetFields();

    try {
      const data = await calculatorApi.getTemplateById(id);
      setTemplate(data);
    } catch {
      messageApi.error('Не удалось загрузить шаблон');
    }
  };

  const summaryItems = useMemo(() => {
    if (!template) return [];

    return template.fields.map((field) => ({
      label: field.name,
      value: field.key,
      type: field.type,
      required: field.isRequired,
    }));
  }, [template]);

  return (
    <>
      {contextHolder}

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card className="page-card page-hero-card">
          <div className="page-hero-grid">
            <div>
              <Typography.Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
                Калькулятор менеджера
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Выберите шаблон, заполните поля и получите итоговую стоимость автоматически.
                Кнопка «Рассчитать» не нужна — результат обновляется на лету.
              </Typography.Paragraph>
            </div>

            <div className="hero-metric-box">
              <div className="hero-metric-value">{templates.length}</div>
              <div className="hero-metric-label">Доступно шаблонов</div>
            </div>
          </div>

          <div style={{ marginTop: 20, maxWidth: 440 }}>
            <Select
              size="large"
              style={{ width: '100%' }}
              placeholder="Выберите калькулятор"
              options={templates.map((item) => ({ label: item.name, value: item.id }))}
              value={selectedId ?? undefined}
              onChange={(value) => void handleSelect(value)}
            />
          </div>
        </Card>

        {!template ? (
          <Card className="page-card">
            <div className="nice-empty-state">
              <Empty description="Сначала выберите шаблон калькулятора" />
            </div>
          </Card>
        ) : (
          <div className="grid-two">
            <Card
              className="page-card"
              title={
                <div className="card-title-stack">
                  <span>{template.name}</span>
                  <Typography.Text type="secondary" style={{ fontWeight: 400 }}>
                    Введите данные для расчета
                  </Typography.Text>
                </div>
              }
            >
              <Form form={form} layout="vertical">
                {template.fields.map((field) => {
                  if (field.type === 'number') {
                    return (
                      <Form.Item
                        key={field.id}
                        name={field.key}
                        label={field.name}
                        rules={field.isRequired ? [{ required: true, message: 'Заполните поле' }] : []}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Введите число"
                          controls={false}
                        />
                      </Form.Item>
                    );
                  }

                  return (
                    <Form.Item
                      key={field.id}
                      name={field.key}
                      label={field.name}
                      rules={field.isRequired ? [{ required: true, message: 'Выберите значение' }] : []}
                    >
                      <Select
                        placeholder="Выберите значение"
                        options={field.dictionary?.values.map((item) => ({
                          label: `${item.label} (${item.value})`,
                          value: item.value,
                        }))}
                      />
                    </Form.Item>
                  );
                })}
              </Form>
            </Card>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card
                className="page-card"
                title={
                  <div className="card-title-stack">
                    <span>Структура шаблона</span>
                    <Typography.Text type="secondary" style={{ fontWeight: 400 }}>
                      Поля и формула расчета
                    </Typography.Text>
                  </div>
                }
              >
                <div className="template-summary-list">
                  {summaryItems.map((item, index) => (
                    <div className="template-summary-row" key={`${item.value}_${index}`}>
                      <div className="template-summary-left">
                        <Typography.Text>{item.label}</Typography.Text>
                        <div className="template-summary-tags">
                          <Tag>{item.value}</Tag>
                          <Tag color="blue">{item.type}</Tag>
                          {item.required && <Tag color="green">Обязательное</Tag>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="formula-preview-box">
                  <Typography.Text strong>Формула:</Typography.Text>
                  <div className="formula-preview-code">
                    {template.formulas[0]?.expression || 'Формула не указана'}
                  </div>
                </div>
              </Card>

              <Card className="page-card sticky-result result-card">
                <div className="result-card-header">
                  <div>
                    <Typography.Text type="secondary">Результат расчета</Typography.Text>
                    <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                      {template.formulas[0]?.name || 'Итого'}
                    </Typography.Title>
                  </div>

                  <div className="result-badge">
                    Автопересчет
                  </div>
                </div>

                <div className="result-box">{result ?? '—'}</div>

                <Typography.Text type="secondary">
                  Результат обновляется мгновенно при изменении формы.
                </Typography.Text>
              </Card>
            </Space>
          </div>
        )}
      </Space>
    </>
  );
};