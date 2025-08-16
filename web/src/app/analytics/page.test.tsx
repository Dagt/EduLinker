import { render, screen } from '@testing-library/react';
import React from 'react';
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
import AnalyticsPage from './page';
import {
  getAnalytics,
  getComplaintsAnalytics,
  getFundraisingAnalytics,
  getEngagementAnalytics,
} from '@/lib/api';

jest.mock('@/lib/auth', () => ({ getToken: () => 'token' }));
jest.mock('@/lib/roles', () => ({ requireRole: () => true }));
jest.mock('@/lib/api');

const overview = { events_by_scope: [{ scope: 'GLOBAL', total: 3 }] };
const complaints = { complaints_by_group: [{ group: 1, total: 2 }] };
const fundraising = { fundraising_by_group: [{ group__id: 1, total: 100 }] };
const engagement = { surveys_participation: [{ group_id: 1, total: 4 }] };

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('AnalyticsPage', () => {
  beforeEach(() => {
    (getAnalytics as jest.Mock).mockReset();
    (getComplaintsAnalytics as jest.Mock).mockReset();
    (getFundraisingAnalytics as jest.Mock).mockReset();
    (getEngagementAnalytics as jest.Mock).mockReset();
  });

  it('renders translations', async () => {
    (getAnalytics as jest.Mock).mockResolvedValue(overview);
    (getComplaintsAnalytics as jest.Mock).mockResolvedValue(complaints);
    (getFundraisingAnalytics as jest.Mock).mockResolvedValue(fundraising);
    (getEngagementAnalytics as jest.Mock).mockResolvedValue(engagement);
    render(<AnalyticsPage />);
    await screen.findByText('Quejas por grupo');
    expect(screen.getByText('Recaudación por grupo')).toBeInTheDocument();
  });
});

