import { ConfigProvider, theme } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/widgets/layout/ui/AppLayout';
import { DictionariesPage } from '@/pages/dictionaries/ui/DictionariesPage';
import { TemplatesPage } from '@/pages/templates/ui/TemplatesPage';
import { CalculatorPage } from '@/pages/calculator/ui/CalculatorPage';

export default function App() {
  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          colorSuccess: '#16a34a',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 18,
          wireframe: false,
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          controlHeight: 44,
          colorText: '#0f172a',
          colorTextSecondary: '#64748b',
          colorBgLayout: '#f4f7fb',
          colorBgContainer: '#ffffff',
          colorBorder: '#e2e8f0',
        },
      }}
    >
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/calculator" replace />} />
          <Route path="/dictionaries" element={<DictionariesPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="*" element={<Navigate to="/calculator" replace />} />
        </Routes>
      </AppLayout>
    </ConfigProvider>
  );
}