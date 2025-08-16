import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
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
import AnalyticsDashboard from './dashboard/analytics/page';
import Login from './(auth)/login/page';
import { apiGet, getAnalytics } from '@/lib/api';

describe('internationalized pages render', () => {
  beforeEach(() => {
    (apiGet as jest.Mock).mockReset();
    (getAnalytics as jest.Mock).mockReset();
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

  it('renders AnalyticsDashboard', async () => {
    (getAnalytics as jest.Mock).mockResolvedValue({});
    render(<AnalyticsDashboard />);
    expect(await screen.findByText('Dashboard Analítico')).toBeInTheDocument();
  });

  it('renders Login', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: 'EduLinker — Dirección' })).toBeInTheDocument();
  });
});

