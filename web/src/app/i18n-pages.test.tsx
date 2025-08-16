import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
jest.mock('@/lib/api');
jest.mock('@/lib/auth', () => ({ getToken: () => 'token' }));
jest.mock('@/lib/roles', () => ({ requireRole: () => true }));
import * as nextIntl from 'next-intl';
const { setMessages } = nextIntl as any;
import en from '@/i18n/en.json';
import es from '@/i18n/es.json';

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
describe.each([
  ['es', es],
  ['en', en]
])('internationalized pages render (%s)', (_locale, messages) => {
  beforeEach(() => {
    setMessages(messages);
    (apiGet as jest.Mock).mockReset();
    (getAnalytics as jest.Mock).mockReset();
  });

  it('renders ComplaintCreate', () => {
    render(<ComplaintCreate />);
    expect(screen.getByRole('heading', { name: messages.ComplaintCreate.header })).toBeInTheDocument();
  });

  it('renders ComplaintThread', async () => {
    (apiGet as jest.Mock).mockResolvedValue({status:'open', description:'d', messages:[]});
    render(<ComplaintThread params={{id:'1'}} />);
    const expected = messages.ComplaintThread.header.replace('{id}', '1');
    expect(await screen.findByText(expected)).toBeInTheDocument();
  });

  it('renders CalendarCreate', () => {
    render(<CalendarCreate />);
    expect(screen.getByRole('heading', { name: messages.CalendarCreate.header })).toBeInTheDocument();
  });

  it('renders Calendar', async () => {
    (apiGet as jest.Mock).mockResolvedValue([]);
    render(<CalendarPage />);
    expect(await screen.findByRole('heading', { name: messages.Calendar.header })).toBeInTheDocument();
  });

  it('renders NotificationSettings', async () => {
    (apiGet as jest.Mock).mockResolvedValue([]);
    render(<NotifSettings />);
    expect(await screen.findByText(messages.NotificationSettings.header)).toBeInTheDocument();
  });

  it('renders SurveyCreate', () => {
    render(<SurveyCreate />);
    expect(screen.getByRole('heading', { name: messages.SurveyCreate.header })).toBeInTheDocument();
  });

  it('renders SurveyVote', () => {
    render(<SurveyVote />);
    expect(screen.getByRole('heading', { name: messages.SurveyVote.header })).toBeInTheDocument();
  });

  it('renders FundraisingCreateEvent', () => {
    render(<FundraisingCreateEvent />);
    expect(screen.getByRole('heading', { name: messages.FundraisingCreateEvent.header })).toBeInTheDocument();
  });

  it('renders AnalyticsDashboard', async () => {
    (getAnalytics as jest.Mock).mockResolvedValue({});
    render(<AnalyticsDashboard />);
    expect(await screen.findByText(messages.AnalyticsDashboard.header)).toBeInTheDocument();
  });

  it('renders Login', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: messages.Login.title })).toBeInTheDocument();
  });
});

