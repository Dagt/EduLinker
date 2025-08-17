import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeworkCreate from '../Create';
import { createHomework, apiGet } from '../../../api';
import { pickAndUpload } from '../../../services/uploads';
import { getRole } from '../../../role';
import i18n from '../../../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ createHomework: jest.fn(), apiGet: jest.fn() }));
jest.mock('../../../services/uploads', () => ({ pickAndUpload: jest.fn() }));
jest.mock('../../../role', () => ({ getRole: jest.fn() }));

i18n.locale = 'es';

test('sends payload to API', async () => {
  (getRole as jest.Mock).mockResolvedValue('MAESTRO_TITULAR');
  (apiGet as jest.Mock).mockResolvedValue([{ id:1, name:'G1'}]);
  (pickAndUpload as jest.Mock).mockResolvedValue('https://u');

  const { getByPlaceholderText, getByText } = render(<HomeworkCreate />);

  await waitFor(() => getByPlaceholderText(i18n.t('homeworkCreate.fieldTitle')));
  fireEvent.changeText(getByPlaceholderText(i18n.t('homeworkCreate.fieldTitle')), 'T');
  fireEvent.changeText(getByPlaceholderText(i18n.t('homeworkCreate.fieldDescription')), 'D');
  fireEvent.changeText(getByPlaceholderText(i18n.t('homeworkCreate.fieldDueDate')), '2024-01-01');
  fireEvent.press(getByText(i18n.t('homeworkCreate.attach')));
  await waitFor(() => expect(pickAndUpload).toHaveBeenCalled());
  fireEvent.press(getByText(i18n.t('homeworkCreate.submit')));
  await waitFor(() => expect(createHomework).toHaveBeenCalledWith({
    title:'T',
    description:'D',
    due_date:'2024-01-01',
    group:1,
    subject:'',
    attachments:['https://u'],
  }));
});

test('blocks unauthorized roles', async () => {
  (getRole as jest.Mock).mockResolvedValue('PADRE');
  const { getByText } = render(<HomeworkCreate />);
  await waitFor(() => getByText(i18n.t('general.unauthorized')));
});
