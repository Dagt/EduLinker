import { render, fireEvent, waitFor } from '@testing-library/react';
import UploadButton from './UploadButton';
import { getToken } from '@/lib/auth';

jest.mock('@/lib/auth');

const originalFetch = global.fetch;
const originalAlert = global.alert;

describe('UploadButton', () => {
  beforeEach(() => {
    (getToken as jest.Mock).mockReturnValue('tk');
    global.fetch = jest.fn();
    global.alert = jest.fn();
    process.env.NEXT_PUBLIC_API_URL = 'http://api';
    process.env.NEXT_PUBLIC_SCHOOL_ID = '1';
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockReset();
    (global.alert as jest.Mock).mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    global.alert = originalAlert;
  });

  it('uploads file and invokes callback', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ upload: { url: 'http://s3', fields: {} }, file_url: 'http://f' })
      })
      .mockResolvedValueOnce({ ok: true });

    const onUploaded = jest.fn();
    const { container } = render(<UploadButton onUploaded={onUploaded} />);
    const input = container.querySelector('input') as HTMLInputElement;
    const file = new File(['hi'], 'hi.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith('http://f'));
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(input.value).toBe('');
  });

  it('alerts on presign error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const onUploaded = jest.fn();
    const { container } = render(<UploadButton onUploaded={onUploaded} />);
    const input = container.querySelector('input') as HTMLInputElement;
    const file = new File(['hi'], 'hi.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Error presign'));
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it('alerts on S3 error', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ upload: { url: 'http://s3', fields: {} }, file_url: 'http://f' })
      })
      .mockResolvedValueOnce({ ok: false });
    const onUploaded = jest.fn();
    const { container } = render(<UploadButton onUploaded={onUploaded} />);
    const input = container.querySelector('input') as HTMLInputElement;
    const file = new File(['hi'], 'hi.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Error S3'));
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it('ignores when no file selected', () => {
    const onUploaded = jest.fn();
    const { container } = render(<UploadButton onUploaded={onUploaded} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(onUploaded).not.toHaveBeenCalled();
  });
    it('uses default school id when env missing', async () => {
      delete process.env.NEXT_PUBLIC_SCHOOL_ID;
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ upload: { url: 'http://s3', fields: {} }, file_url: 'http://f' }) })
        .mockResolvedValueOnce({ ok: true });
      const onUploaded = jest.fn();
      const { container } = render(<UploadButton onUploaded={onUploaded} />);
      const input = container.querySelector('input') as HTMLInputElement;
      const file = new File(['hi'], 'hi.txt', { type: 'text/plain' });
      fireEvent.change(input, { target: { files: [file] } });
      await waitFor(() => expect(onUploaded).toHaveBeenCalled());
      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers['X-School-ID']).toBe('1');
    });
});
