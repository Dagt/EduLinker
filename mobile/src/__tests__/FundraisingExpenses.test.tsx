import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import FundraisingExpenses from '../screens/FundraisingExpenses';
import i18n from '../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock('../api', () => ({
  getFundraisingSummary: jest.fn(),
  createExpenseEvidence: jest.fn(),
  postActivityPhoto: jest.fn(),
}));
jest.mock('../services/uploads', () => ({ pickAndUpload: jest.fn() }));

jest.setTimeout(10000);

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(cleanup);

describe('FundraisingExpenses screen', () => {
  it('restricts unauthorized users', async () => {
    const { getRole } = require('../role');
    const { getFundraisingSummary } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('student');
    (getFundraisingSummary as jest.Mock).mockResolvedValue({ expenses: [] });
    const { getByText } = render(<FundraisingExpenses />);
    await waitFor(() => getByText(i18n.t('general.unauthorized')));
  });

  it('creates and lists expenses', async () => {
    const { getRole } = require('../role');
    const { getFundraisingSummary, createExpenseEvidence, postActivityPhoto } = require('../api');
    const { pickAndUpload } = require('../services/uploads');
    (getRole as jest.Mock).mockResolvedValue('treasurer');
    (getFundraisingSummary as jest.Mock)
      .mockResolvedValueOnce({ expenses: [] })
      .mockResolvedValueOnce({ expenses: [{ concept: 'Food', amount: '20', file_url: 'https://u' }] });
    (createExpenseEvidence as jest.Mock).mockResolvedValue({ id: 1 });
    (pickAndUpload as jest.Mock).mockResolvedValue('https://u');
    (postActivityPhoto as jest.Mock).mockResolvedValue({});
    i18n.locale = 'en';
    const { getByPlaceholderText, getByText } = render(<FundraisingExpenses />);
    await waitFor(() => getByText(/Fundraising Expenses/));
    fireEvent.changeText(getByPlaceholderText('Event ID'), '1');
    fireEvent.changeText(getByPlaceholderText('Ledger ID'), '2');
    fireEvent.changeText(getByPlaceholderText('Concept'), 'Food');
    fireEvent.changeText(getByPlaceholderText('Amount'), '20');
    fireEvent.press(getByText('Pick Photo'));
    await waitFor(() => getByText(/File:/));
    fireEvent.press(getByText('Add'));
    await waitFor(() => {
      expect(createExpenseEvidence).toHaveBeenCalledWith({
        ledger: 2,
        file_url: 'https://u',
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
    (getFundraisingSummary as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    i18n.locale = 'en';
    const { getByText } = render(<FundraisingExpenses />);
    await waitFor(() => getByText(i18n.t('general.error')));
  });
});

