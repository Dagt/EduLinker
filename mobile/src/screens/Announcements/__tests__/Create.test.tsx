import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AnnouncementCreate from '../Create';
import { createAnnouncement, apiGet } from '../../../api';
import { pickAndUpload } from '../../../services/uploads';
import { getRole } from '../../../role';
import i18n from '../../../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ createAnnouncement: jest.fn(), apiGet: jest.fn() }));
jest.mock('../../../services/uploads', () => ({ pickAndUpload: jest.fn() }));
jest.mock('../../../role', () => ({ getRole: jest.fn() }));

i18n.locale = 'es';

test('sends payload to API', async () => {
  (getRole as jest.Mock).mockResolvedValue('MAESTRO_TITULAR');
  (apiGet as jest.Mock).mockResolvedValue([{ id:1, name:'G1'}]);
  (pickAndUpload as jest.Mock).mockResolvedValue('https://u');

  const { getByPlaceholderText, getByText } = render(<AnnouncementCreate />);

  await waitFor(() => getByPlaceholderText(i18n.t('announcementCreate.fieldTitle')));
  fireEvent.changeText(getByPlaceholderText(i18n.t('announcementCreate.fieldTitle')), 'A');
  fireEvent.changeText(getByPlaceholderText(i18n.t('announcementCreate.fieldMessage')), 'M');
  fireEvent.changeText(getByPlaceholderText(i18n.t('announcementCreate.fieldDate')), '2024-01-01');
  fireEvent.press(getByText(i18n.t('announcementCreate.attach')));
  await waitFor(() => expect(pickAndUpload).toHaveBeenCalled());
  fireEvent.press(getByText(i18n.t('announcementCreate.submit')));
  await waitFor(() => expect(createAnnouncement).toHaveBeenCalledWith({
    title:'A',
    message:'M',
    group:1,
    scope:'GRUPO',
    publish_date:'2024-01-01',
    attachments:['https://u'],
  }));
});

test('blocks unauthorized roles', async () => {
  (getRole as jest.Mock).mockResolvedValue('PADRE');
  const { getByText } = render(<AnnouncementCreate />);
  await waitFor(() => getByText(i18n.t('general.unauthorized')));
});
