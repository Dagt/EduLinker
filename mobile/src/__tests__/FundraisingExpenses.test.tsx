import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import FundraisingExpenses from '../screens/FundraisingExpenses';
import i18n from '../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock('../api', () => ({
  getFundraisingSummary: jest.fn(),
  createExpenseEvidence: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(cleanup);

describe('FundraisingExpenses screen', () => {
  it('restricts unauthorized users', async () => {
    const { getRole } = require('../role');
    const { getFundraisingSummary } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('student');
    (getFundraisingSummary as jest.Mock).mockResolvedValue({ expenses: [] });
    const { getByText } = render(<FundraisingExpenses />);
    await waitFor(() => getByText(/Unauthorized/));
  });

  it('creates and lists expenses', async () => {
    const { getRole } = require('../role');
    const { getFundraisingSummary, createExpenseEvidence } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('treasurer');
    (getFundraisingSummary as jest.Mock)
      .mockResolvedValueOnce({ expenses: [] })
      .mockResolvedValueOnce({ expenses: [{ concept: 'Food', amount: '20', file_url: 'http://x' }] });
    (createExpenseEvidence as jest.Mock).mockResolvedValue({ id: 1 });
    i18n.locale = 'en';
    const { getByPlaceholderText, getByText } = render(<FundraisingExpenses />);
    await waitFor(() => getByText(/Fundraising Expenses/));
    fireEvent.changeText(getByPlaceholderText('Event ID'), '1');
    fireEvent.changeText(getByPlaceholderText('Ledger ID'), '2');
    fireEvent.changeText(getByPlaceholderText('Concept'), 'Food');
    fireEvent.changeText(getByPlaceholderText('Amount'), '20');
    fireEvent.changeText(getByPlaceholderText('File URL'), 'http://x');
    fireEvent.press(getByText('Add'));
    await waitFor(() => {
      expect(createExpenseEvidence).toHaveBeenCalledWith({
        ledger: 2,
        file_url: 'http://x',
        amount: '20',
        concept: 'Food',
      });
    });
    await waitFor(() => getByText(/Food/));
    fireEvent.press(getByText(/Food/));
    await waitFor(() => getByText(/Amount/));
  });

  it('handles load errors', async () => {
    const { getRole } = require('../role');
    const { getFundraisingSummary } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('treasurer');
    (getFundraisingSummary as jest.Mock).mockRejectedValue(new Error('fail'));
    i18n.locale = 'en';
    const { getByText } = render(<FundraisingExpenses />);
    await waitFor(() => getByText(i18n.t('general.error')));
  });
});

