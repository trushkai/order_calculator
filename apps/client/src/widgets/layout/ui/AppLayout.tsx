import type { PropsWithChildren } from 'react';
import { Layout, Menu, Segmented, Space, Typography, Breadcrumb } from 'antd';
import {
  CalculatorOutlined,
  DatabaseOutlined,
  FormOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRoleStore } from '@/features/template-builder/model/useRoleStore';
import type { RoleMode } from '@/entities/template/model/types';

const { Header, Content } = Layout;

const adminItems = [
  {
    key: '/dictionaries',
    icon: <DatabaseOutlined />,
    label: <Link to="/dictionaries">Справочники</Link>,
  },
  {
    key: '/templates',
    icon: <FormOutlined />,
    label: <Link to="/templates">Конструктор шаблонов</Link>,
  },
  {
    key: '/calculator',
    icon: <CalculatorOutlined />,
    label: <Link to="/calculator">Калькулятор</Link>,
  },
];

const managerItems = [
  {
    key: '/calculator',
    icon: <CalculatorOutlined />,
    label: <Link to="/calculator">Калькулятор</Link>,
  },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/dictionaries': {
    title: 'Справочники',
    subtitle: 'Управление значениями для выпадающих списков',
  },
  '/templates': {
    title: 'Конструктор шаблонов',
    subtitle: 'Создание полей, формул и шаблонов расчета',
  },
  '/calculator': {
    title: 'Калькулятор менеджера',
    subtitle: 'Быстрый расчет итоговой суммы по готовому шаблону',
  },
};

export const AppLayout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole } = useRoleStore();

  const items = role === 'admin' ? adminItems : managerItems;
  const current = items.some((item) => item.key === location.pathname) ? location.pathname : items[0].key;
  const currentMeta = pageMeta[location.pathname] ?? pageMeta['/calculator'];

  const breadcrumbItems = [
    {
      title: (
        <span className="app-breadcrumb-home">
          <HomeOutlined />
          <span>Главная</span>
        </span>
      ),
    },
    {
      title: currentMeta.title,
    },
  ];

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="app-header-inner">
          <div
            className="app-brand"
            onClick={() => navigate('/calculator')}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                navigate('/calculator');
              }
            }}
          >
            <div className="app-brand-logo">OC</div>

            <div className="app-brand-text">
              <Typography.Title level={4} className="app-brand-title">
                Order Calculator
              </Typography.Title>
              <div className="app-brand-subtitle">
                Конструктор калькуляторов заказов
              </div>
            </div>
          </div>

          <Menu
            mode="horizontal"
            selectedKeys={[current]}
            items={items}
            className="app-top-menu"
          />

          <div className="app-header-actions">
            <Segmented<RoleMode>
              className="role-switcher"
              options={[
                { label: 'Админ', value: 'admin' },
                { label: 'Менеджер', value: 'manager' },
              ]}
              value={role}
              onChange={(value) => setRole(value)}
            />
          </div>
        </div>
      </Header>

      <Content className="app-content">
        <div className="page-intro page-intro-polished">
          <div className="page-intro-top">
            <Breadcrumb items={breadcrumbItems} className="page-breadcrumb" />
            <div className="page-status-chip">
              Режим: {role === 'admin' ? 'Администратор' : 'Менеджер'}
            </div>
          </div>

          <div className="page-intro-main">
            <div>
              <h1 className="page-intro-title">{currentMeta.title}</h1>
              <p className="page-intro-subtitle">{currentMeta.subtitle}</p>
            </div>
          </div>
        </div>

        {children}
      </Content>
    </Layout>
  );
};