import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SurveyCreate from '../Create';
import { createSurvey, apiGet } from '../../../api';
import { getRole } from '../../../role';
import i18n from '../../../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({
  createSurvey: jest.fn(),
  apiGet: jest.fn(),
}));
jest.mock('../../../role', () => ({ getRole: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

test('builds payload for group survey', async () => {
  (getRole as jest.Mock).mockResolvedValue('DIRECTOR');
  (apiGet as jest.Mock).mockResolvedValue([{ id: 1, name: 'G1' }]);
  (createSurvey as jest.Mock).mockResolvedValue({});
  i18n.locale = 'en';
  const { getByPlaceholderText, getByText } = render(<SurveyCreate />);
  await waitFor(() => getByText(i18n.t('surveys.create')));
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveys.fieldTitle')), 'T1');
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveys.fieldDescription')), 'D1');
  fireEvent.changeText(getByPlaceholderText(`${i18n.t('surveys.option')} 1`), 'O1');
  fireEvent.changeText(getByPlaceholderText(`${i18n.t('surveys.option')} 2`), 'O2');
  fireEvent.press(getByText(i18n.t('surveys.scopeGroup')));
  fireEvent.press(getByText(/G1/));
  fireEvent.press(getByText(`${i18n.t('surveys.anonymous')}: ${i18n.t('general.no')}`));
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveys.startAt')), '2023-01-01');
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveys.endAt')), '2023-01-02');
  fireEvent.press(getByText(i18n.t('surveys.submit')));
  await waitFor(() => {
    expect(createSurvey).toHaveBeenCalledWith({
      title: 'T1',
      description: 'D1',
      options: ['O1', 'O2'],
      scope: 'GROUP',
      group: 1,
      is_anonymous: true,
      start_at: '2023-01-01',
      end_at: '2023-01-02',
    });
  });
});

test('builds payload for school survey', async () => {
  (getRole as jest.Mock).mockResolvedValue('DIRECTOR');
  (apiGet as jest.Mock).mockResolvedValue([]);
  (createSurvey as jest.Mock).mockResolvedValue({});
  i18n.locale = 'en';
  const { getByPlaceholderText, getByText } = render(<SurveyCreate />);
  await waitFor(() => getByText(i18n.t('surveys.create')));
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveys.fieldTitle')), 'T2');
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveys.fieldDescription')), 'D2');
  fireEvent.changeText(getByPlaceholderText(`${i18n.t('surveys.option')} 1`), 'A');
  fireEvent.changeText(getByPlaceholderText(`${i18n.t('surveys.option')} 2`), 'B');
  fireEvent.press(getByText(i18n.t('surveys.scopeSchool')));
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveys.startAt')), '2023-03-01');
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveys.endAt')), '2023-03-02');
  fireEvent.press(getByText(i18n.t('surveys.submit')));
  await waitFor(() => {
    expect(createSurvey).toHaveBeenCalledWith({
      title: 'T2',
      description: 'D2',
      options: ['A', 'B'],
      scope: 'SCHOOL',
      is_anonymous: false,
      start_at: '2023-03-01',
      end_at: '2023-03-02',
    });
  });
});

test('restricts unauthorized role', async () => {
  (getRole as jest.Mock).mockResolvedValue('PADRE');
  (apiGet as jest.Mock).mockResolvedValue([]);
  i18n.locale = 'en';
  const { getByText } = render(<SurveyCreate />);
  await waitFor(() => getByText(i18n.t('general.unauthorized')));
});

