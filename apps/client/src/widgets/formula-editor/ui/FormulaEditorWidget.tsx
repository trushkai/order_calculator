import { Button, Card, Divider, Input, Space, Typography } from 'antd';
import type { TemplateFieldPayload } from '@/entities/template/model/types';

interface Props {
  value: string;
  onChange: (value: string) => void;
  fields: TemplateFieldPayload[];
}

const operators = [' + ', ' - ', ' * ', ' / ', ' ( ', ' ) '];

export const FormulaEditorWidget = ({ value, onChange, fields }: Props) => {
  const append = (token: string) => onChange(`${value}${token}`);

  return (
    <Card className="page-card formula-card" title="Редактор формулы">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Typography.Text type="secondary">
          Кликайте по полям и операторам, чтобы быстро собрать выражение. Можно редактировать и руками.
        </Typography.Text>

        <div>
          <Typography.Text strong>Поля</Typography.Text>
          <div className="formula-token-list">
            {fields.map((field, index) => {
              const tokenKey = field.key?.trim() || field.name?.trim() || `field_${index}`;

              return (
                <button
                  key={tokenKey}
                  type="button"
                  className="formula-token-button"
                  onClick={() => append(`#{${field.key}}`)}
                >
                  {field.name || field.key || `Поле ${index + 1}`}
                </button>
              );
            })}
          </div>
        </div>

        <Divider style={{ margin: '4px 0' }} />

        <div>
          <Typography.Text strong>Операторы</Typography.Text>
          <div className="formula-operator-list">
            {operators.map((operator, index) => (
              <Button
                key={`${operator.trim()}_${index}`}
                onClick={() => append(operator)}
                className="formula-operator-button"
              >
                {operator.trim()}
              </Button>
            ))}
          </div>
        </div>

        <Input.TextArea
          rows={5}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Например: (#{base_price} * #{quantity} + #{package_type}) * #{urgency}"
        />

        <div className="formula-hint-box">
          <Typography.Text strong>Подсказка</Typography.Text>
          <Typography.Paragraph style={{ marginBottom: 0, marginTop: 6 }}>
            Формула хранится по ключам полей. Пример:
            <br />
            <code>(#{'{base_price}'} * #{'{quantity}'} + #{'{package_type}'}) * #{'{urgency}'}</code>
          </Typography.Paragraph>
        </div>
      </Space>
    </Card>
  );
};