import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ComplaintDetail from '../Detail';
import { getComplaintMessages, escalateComplaint } from '../../../api';
import i18n from '../../../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({
  getComplaintMessages: jest.fn(),
  sendComplaintMessage: jest.fn(),
  updateComplaint: jest.fn(),
  deleteComplaint: jest.fn(),
  escalateComplaint: jest.fn(),
}));

test('calls API to escalate complaint', async () => {
  i18n.locale = 'es';
  (getComplaintMessages as jest.Mock).mockResolvedValue([]);
  const { getByText } = render(
    <ComplaintDetail complaint={{ id: 1, content: 'Test' }} onBack={() => {}} />
  );
  await waitFor(() => getByText(i18n.t('complaints.escalate')));
  fireEvent.press(getByText(i18n.t('complaints.escalate')));
  await waitFor(() => expect(escalateComplaint).toHaveBeenCalledWith(1));
});
