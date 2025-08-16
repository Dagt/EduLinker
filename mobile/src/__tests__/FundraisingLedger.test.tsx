import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import FundraisingLedger from '../screens/FundraisingLedger';
import i18n from '../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock('../api', () => ({
  getFundraisingSummary: jest.fn(),
  createFundraisingLedger: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(cleanup);

describe('FundraisingLedger screen', () => {
  it('restricts unauthorized users', async () => {
    const { getRole } = require('../role');
    const { getFundraisingSummary } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('student');
    (getFundraisingSummary as jest.Mock).mockResolvedValue({ ledgers: [] });
    const { getByText } = render(<FundraisingLedger />);
    await waitFor(() => getByText(/Unauthorized/));
  });

  it('creates and lists ledger entries', async () => {
    const { getRole } = require('../role');
    const { getFundraisingSummary, createFundraisingLedger } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('treasurer');
    (getFundraisingSummary as jest.Mock)
      .mockResolvedValueOnce({ ledgers: [] })
      .mockResolvedValueOnce({ ledgers: [{ group__name: 'G1', total: '50' }] });
    (createFundraisingLedger as jest.Mock).mockResolvedValue({ id: 1 });
    i18n.locale = 'en';
    const { getByPlaceholderText, getByText } = render(<FundraisingLedger />);
    await waitFor(() => getByText(/Fundraising Ledger/));
    fireEvent.changeText(getByPlaceholderText('Event ID'), '1');
    fireEvent.changeText(getByPlaceholderText('Group ID'), '2');
    fireEvent.changeText(getByPlaceholderText('Amount'), '50');
    fireEvent.press(getByText('Add'));
    await waitFor(() => {
      expect(createFundraisingLedger).toHaveBeenCalledWith({
        event: 1,
        group: 2,
        amount_collected: '50',
      });
    });
    await waitFor(() => getByText(/G1/));
    fireEvent.press(getByText(/G1/));
    await waitFor(() => getByText(/Total/));
  });

  it('handles load errors', async () => {
    const { getRole } = require('../role');
    const { getFundraisingSummary } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('treasurer');
    (getFundraisingSummary as jest.Mock).mockRejectedValue(new Error('fail'));
    i18n.locale = 'en';
    const { getByText } = render(<FundraisingLedger />);
    await waitFor(() => getByText(i18n.t('general.error')));
  });
});

