import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SurveyCreate from '../Create';
import { createSurvey, apiGet } from '../../../api';
import { getRole } from '../../../role';
import i18n from '../../../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ createSurvey: jest.fn(), apiGet: jest.fn() }));
jest.mock('../../../role', () => ({ getRole: jest.fn() }));

i18n.locale = 'es';

test('sends payload to API', async () => {
  (getRole as jest.Mock).mockResolvedValue('MAESTRO_TITULAR');
  (apiGet as jest.Mock).mockResolvedValue([{ id:1, name:'G1' }]);

  const { getByPlaceholderText, getByText } = render(<SurveyCreate />);

  await waitFor(()=> getByPlaceholderText(i18n.t('surveyCreate.fieldTitle')));
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveyCreate.fieldTitle')), 'T');
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveyCreate.fieldDescription')), 'D');
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveyCreate.fieldOptions')), 'O1,O2');
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveyCreate.fieldStart')), '2024-01-01');
  fireEvent.changeText(getByPlaceholderText(i18n.t('surveyCreate.fieldEnd')), '2024-01-02');
  fireEvent.press(getByText(i18n.t('surveyCreate.submit')));

  await waitFor(()=> expect(createSurvey).toHaveBeenCalledWith({
    title:'T',
    description:'D',
    options:['O1','O2'],
    scope:'GRUPO',
    group:1,
    anonymous:false,
    start_at:'2024-01-01',
    end_at:'2024-01-02',
  }));
});

test('blocks unauthorized roles', async () => {
  (getRole as jest.Mock).mockResolvedValue('PADRE');
  const { getByText } = render(<SurveyCreate />);
  await waitFor(()=> getByText(i18n.t('general.unauthorized')));
});
