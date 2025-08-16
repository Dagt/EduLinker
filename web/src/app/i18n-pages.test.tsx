import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
jest.mock('recharts', () => {
  const React = require('react');
  const Mock = ({ children }: any) => <div>{children}</div>;
  return {
    BarChart: Mock,
    Bar: Mock,
    XAxis: Mock,
    YAxis: Mock,
    Tooltip: Mock,
    ResponsiveContainer: Mock,
    PieChart: Mock,
    Pie: Mock,
    Cell: Mock,
  };
});
jest.mock('@/lib/api');
jest.mock('@/lib/auth', () => ({ getToken: () => 'token' }));
jest.mock('@/lib/roles', () => ({ requireRole: () => true }));

import ComplaintCreate from './complaints/create/page';
import ComplaintThread from './complaints/[id]/page';
import CalendarCreate from './calendar/create/page';
import CalendarPage from './calendar/page';
import NotifSettings from './settings/notifications/page';
import SurveyCreate from './surveys/create/page';
import SurveyVote from './surveys/vote/page';
import FundraisingCreateEvent from './fundraising/create-event/page';
import FundraisingPage from './fundraising/page';
import FundraisingLedger from './fundraising/ledger/page';
import FundraisingExpense from './fundraising/expense/page';
import FundraisingSummary from './fundraising/summary/page';
import AnalyticsDashboard from './dashboard/analytics/page';
import AnalyticsPage from './analytics/page';
import DashboardPage from './dashboard/page';
import Login from './(auth)/login/page';
import SuggestionsPage from './(suggestions)/suggestions/page';
import SuggestionCreate from './(suggestions)/suggestions/create/page';
import SuggestionStatus from './(suggestions)/suggestions/status/page';
import GroupList from './groups/page';
import GroupCreate from './groups/create/page';
import GroupEdit from './groups/edit/page';
import AssignHomeroom from './groups/assign-homeroom/page';
import AssignSpecialist from './groups/assign-specialist/page';
import AssignVocal from './groups/assign-vocal/page';
import {
  apiGet,
  getAnalytics,
  getComplaintsAnalytics,
  getFundraisingAnalytics,
  getEngagementAnalytics,
  listFundraisingEvents,
} from '@/lib/api';

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('internationalized pages render', () => {
  beforeEach(() => {
    (apiGet as jest.Mock).mockReset();
    (getAnalytics as jest.Mock).mockReset();
    (getComplaintsAnalytics as jest.Mock).mockReset();
    (getFundraisingAnalytics as jest.Mock).mockReset();
    (getEngagementAnalytics as jest.Mock).mockReset();
  });

  it('renders ComplaintCreate', () => {
    render(<ComplaintCreate />);
    expect(screen.getByRole('heading', { name: 'Crear queja privada' })).toBeInTheDocument();
  });

  it('renders ComplaintThread', async () => {
    (apiGet as jest.Mock).mockResolvedValue({status:'open', description:'d', messages:[]});
    render(<ComplaintThread params={{id:'1'}} />);
    expect(await screen.findByText('Queja #1')).toBeInTheDocument();
  });

  it('renders CalendarCreate', () => {
    render(<CalendarCreate />);
    expect(screen.getByRole('heading', { name: 'Crear evento' })).toBeInTheDocument();
  });

  it('renders Calendar', async () => {
    (apiGet as jest.Mock).mockResolvedValue([]);
    render(<CalendarPage />);
    expect(await screen.findByRole('heading', { name: 'Calendario' })).toBeInTheDocument();
  });

  it('renders NotificationSettings', async () => {
    (apiGet as jest.Mock).mockResolvedValue([]);
    render(<NotifSettings />);
    expect(await screen.findByText('Notificaciones')).toBeInTheDocument();
  });

  it('renders SurveyCreate', () => {
    render(<SurveyCreate />);
    expect(screen.getByRole('heading', { name: 'Crear encuesta' })).toBeInTheDocument();
  });

  it('renders SurveyVote', () => {
    render(<SurveyVote />);
    expect(screen.getByRole('heading', { name: 'Votar encuesta' })).toBeInTheDocument();
  });

  it('renders FundraisingCreateEvent', () => {
    render(<FundraisingCreateEvent />);
    expect(screen.getByRole('heading', { name: 'Crear evento de recaudación' })).toBeInTheDocument();
  });

  it('renders FundraisingPage', async () => {
    (listFundraisingEvents as jest.Mock).mockResolvedValue([]);
    render(<FundraisingPage />);
    expect(await screen.findByRole('heading', { name: 'Recaudación' })).toBeInTheDocument();
  });

  it('renders FundraisingLedger', () => {
    render(<FundraisingLedger />);
    expect(screen.getByRole('heading', { name: 'Registrar recaudación por grupo' })).toBeInTheDocument();
  });

  it('renders FundraisingExpense', () => {
    render(<FundraisingExpense />);
    expect(screen.getByRole('heading', { name: 'Registrar evidencia de gasto' })).toBeInTheDocument();
  });

  it('renders FundraisingSummary', () => {
    render(<FundraisingSummary />);
    expect(screen.getByRole('heading', { name: 'Resumen de recaudación' })).toBeInTheDocument();
  });

  it('renders AnalyticsDashboard', async () => {
    (getAnalytics as jest.Mock).mockResolvedValue({});
    (getComplaintsAnalytics as jest.Mock).mockResolvedValue({});
    (getFundraisingAnalytics as jest.Mock).mockResolvedValue({});
    (getEngagementAnalytics as jest.Mock).mockResolvedValue({});
    render(<AnalyticsDashboard />);
    expect(await screen.findByText('Dashboard Analítico')).toBeInTheDocument();
  });

  it('renders AnalyticsPage', async () => {
    (getAnalytics as jest.Mock).mockResolvedValue({ events_by_scope: [] });
    (getComplaintsAnalytics as jest.Mock).mockResolvedValue({ complaints_by_group: [] });
    (getFundraisingAnalytics as jest.Mock).mockResolvedValue({ fundraising_by_group: [] });
    (getEngagementAnalytics as jest.Mock).mockResolvedValue({ surveys_participation: [] });
    render(<AnalyticsPage />);
    expect(
      await screen.findByRole('heading', { name: 'Analíticas' })
    ).toBeInTheDocument();
  });

  it('renders DashboardPage', async () => {
    (apiGet as jest.Mock)
      .mockResolvedValueOnce({ first_name: 'Juan', last_name: 'Pérez' })
      .mockResolvedValueOnce({});
    render(<DashboardPage />);
    expect(await screen.findByText('Bienvenido, Juan Pérez')).toBeInTheDocument();
  });

  it('renders Login', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: 'EduLinker — Dirección' })).toBeInTheDocument();
  });

  it('renders SuggestionsPage', async () => {
    (apiGet as jest.Mock).mockResolvedValue([]);
    render(<SuggestionsPage />);
    expect(await screen.findByRole('heading', { name: 'Sugerencias' })).toBeInTheDocument();
  });

  it('renders SuggestionCreate', () => {
    render(<SuggestionCreate />);
    expect(screen.getByRole('heading', { name: 'Crear sugerencia' })).toBeInTheDocument();
  });

  it('renders SuggestionStatus', () => {
    render(<SuggestionStatus />);
    expect(screen.getByRole('heading', { name: 'Actualizar estado de sugerencia' })).toBeInTheDocument();
  });

  it('renders GroupList', async () => {
    (apiGet as jest.Mock).mockResolvedValue([]);
    render(<GroupList />);
    expect(await screen.findByRole('heading', { name: 'Lista de grupos' })).toBeInTheDocument();
  });

  it('renders GroupCreate', () => {
    render(<GroupCreate />);
    expect(screen.getByRole('heading', { name: 'Crear grupo' })).toBeInTheDocument();
  });

  it('renders GroupEdit', () => {
    render(<GroupEdit />);
    expect(screen.getByRole('heading', { name: 'Editar grupo' })).toBeInTheDocument();
  });

  it('renders AssignHomeroom', () => {
    render(<AssignHomeroom />);
    expect(screen.getByRole('heading', { name: 'Asignar maestro titular' })).toBeInTheDocument();
  });

  it('renders AssignSpecialist', () => {
    render(<AssignSpecialist />);
    expect(screen.getByRole('heading', { name: 'Asignar especialista' })).toBeInTheDocument();
  });

  it('renders AssignVocal', () => {
    render(<AssignVocal />);
    expect(screen.getByRole('heading', { name: 'Asignar vocal' })).toBeInTheDocument();
  });
});

