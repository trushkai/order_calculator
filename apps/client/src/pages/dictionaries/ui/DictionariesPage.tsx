import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { calculatorApi } from '@/shared/api/calculatorApi';
import type { DictionaryCreatePayload, DictionaryDto } from '@/entities/template/model/types';
import { useRoleStore } from '@/features/template-builder/model/useRoleStore';

interface DictionaryFormValues {
  name: string;
  code: string;
  values: Array<{
    label: string;
    value: string;
    sortOrder: number;
  }>;
}

export const DictionariesPage = () => {
  const { role } = useRoleStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [items, setItems] = useState<DictionaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DictionaryDto | null>(null);
  const [form] = Form.useForm<DictionaryFormValues>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await calculatorApi.getDictionaries();
      setItems(data);
    } catch {
      messageApi.error('Не удалось загрузить справочники');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      name: '',
      code: '',
      values: [{ label: '', value: '', sortOrder: 0 }],
    });
    setOpen(true);
  };

  const openEdit = (item: DictionaryDto) => {
    setEditing(item);
    form.setFieldsValue({
      name: item.name,
      code: item.code,
      values: item.values.map((value) => ({
        label: value.label,
        value: value.value,
        sortOrder: value.sortOrder,
      })),
    });
    setOpen(true);
  };

  const handleDelete = (item: DictionaryDto) => {
    Modal.confirm({
      title: 'Удалить справочник?',
      content: `Справочник «${item.name}» будет удален без возможности восстановления.`,
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await calculatorApi.deleteDictionary(item.id);

          if (editing?.id === item.id) {
            setEditing(null);
            setOpen(false);
          }

          messageApi.success('Справочник удален');
          await fetchData();
        } catch (error) {
          if (axios.isAxiosError(error)) {
            messageApi.error(
              error.response?.data?.message ?? 'Не удалось удалить справочник',
            );
          } else {
            messageApi.error('Не удалось удалить справочник');
          }
        }
      },
    });
  };

  const submit = async () => {
    const values = await form.validateFields();

    const payload: DictionaryCreatePayload = {
      ...values,
      values: values.values.map((item, index) => ({
        label: item.label,
        value: item.value,
        sortOrder: item.sortOrder ?? index,
      })),
    };

    try {
      if (editing) {
        await calculatorApi.updateDictionary(editing.id, payload);
        messageApi.success('Справочник обновлен');
      } else {
        await calculatorApi.createDictionary(payload);
        messageApi.success('Справочник создан');
      }

      setOpen(false);
      await fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        messageApi.error(error.response?.data?.message ?? 'Не удалось сохранить справочник');
      } else {
        messageApi.error('Не удалось сохранить справочник');
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'Название',
        dataIndex: 'name',
        render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
      },
      {
        title: 'Код',
        dataIndex: 'code',
        render: (value: string) => <Tag>{value}</Tag>,
      },
      {
        title: 'Количество значений',
        render: (_: unknown, record: DictionaryDto) => <Tag color="blue">{record.values.length}</Tag>,
      },
      {
        title: 'Действия',
        render: (_: unknown, record: DictionaryDto) => (
          <Space wrap>
            <Button onClick={() => openEdit(record)} disabled={role !== 'admin'}>
              Редактировать
            </Button>
            <Button danger onClick={() => handleDelete(record)} disabled={role !== 'admin'}>
              Удалить
            </Button>
          </Space>
        ),
      },
    ],
    [role, editing],
  );

  if (role !== 'admin') {
    return (
      <Card className="page-card">
        <Typography.Title level={4}>Справочники</Typography.Title>
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
                Модуль «Справочники»
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Создавайте справочники и наполняйте их значениями для выпадающих списков в шаблонах.
              </Typography.Paragraph>
            </div>

            <div className="hero-metric-box">
              <div className="hero-metric-value">{items.length}</div>
              <div className="hero-metric-label">Всего справочников</div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Button type="primary" size="large" onClick={openCreate}>
              Создать справочник
            </Button>
          </div>
        </Card>

        <Card className="page-card" loading={loading}>
          <Table rowKey="id" dataSource={items} columns={columns} pagination={false} />
        </Card>
      </Space>

      <Modal
        title={editing ? 'Редактирование справочника' : 'Новый справочник'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void submit()}
        okText="Сохранить"
        cancelText="Отмена"
        width={920}
      >
        <Form form={form} layout="vertical">
          <div className="grid-two">
            <Form.Item
              name="name"
              label="Название"
              rules={[{ required: true, message: 'Введите название' }]}
            >
              <Input placeholder="Например, Тип перевозки" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Код"
              rules={[{ required: true, message: 'Введите код' }]}
            >
              <Input placeholder="transport_type" />
            </Form.Item>
          </div>

          <Typography.Title level={5}>Значения справочника</Typography.Title>

          <Form.List name="values">
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                {fields.map((field) => (
                  <Card key={field.key} size="small" className="nested-soft-card">
                    <div className="grid-two">
                      <Form.Item
                        {...field}
                        name={[field.name, 'label']}
                        label="Отображаемое название"
                        rules={[{ required: true, message: 'Введите отображаемое название' }]}
                      >
                        <Input placeholder="Например, Рефрижератор" />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        label="Значение"
                        rules={[{ required: true, message: 'Введите значение' }]}
                      >
                        <Input placeholder="1.4" />
                      </Form.Item>
                    </div>

                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'sortOrder']}
                        label="Порядок"
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber min={0} style={{ width: 180 }} />
                      </Form.Item>

                      <Button danger onClick={() => remove(field.name)}>
                        Удалить
                      </Button>
                    </Space>
                  </Card>
                ))}

                <Button onClick={() => add({ label: '', value: '', sortOrder: fields.length })}>
                  Добавить значение
                </Button>
              </Space>
            )}
          </Form.List>
        </Form>

        {editing && (
          <Card size="small" className="nested-soft-card" style={{ marginTop: 18 }}>
            <Typography.Text strong>Текущие значения</Typography.Text>
            <List
              size="small"
              dataSource={editing.values}
              renderItem={(item) => (
                <List.Item>
                  <Space wrap>
                    <Tag>{item.label}</Tag>
                    <Typography.Text type="secondary">value: {item.value}</Typography.Text>
                    <Typography.Text type="secondary">order: {item.sortOrder}</Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}
      </Modal>
    </>
  );
};