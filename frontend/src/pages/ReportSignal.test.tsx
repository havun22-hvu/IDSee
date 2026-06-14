import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ReportSignal } from './ReportSignal';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: { reportFraud: vi.fn() },
}));

describe('ReportSignal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a signal with type, chip and description', async () => {
    (api.reportFraud as ReturnType<typeof vi.fn>).mockResolvedValue({ message: 'ok' });

    render(<ReportSignal />);
    fireEvent.change(screen.getByLabelText(/Chipnummer/), {
      target: { value: '528000000000000' },
    });
    fireEvent.change(screen.getByLabelText('Beschrijving'), {
      target: { value: 'Paspoort zonder bron' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Signaal indienen/ }));

    await waitFor(() => {
      expect(screen.getByText(/Een geverifieerde dierenarts beoordeelt/)).toBeInTheDocument();
    });
    expect(api.reportFraud).toHaveBeenCalledWith({
      type: 'omgekat_paspoort',
      description: 'Paspoort zonder bron',
      chipId: '528000000000000',
    });
  });

  it('blocks submit without a description', async () => {
    render(<ReportSignal />);
    fireEvent.click(screen.getByRole('button', { name: /Signaal indienen/ }));

    await waitFor(() => {
      expect(screen.getByText(/Geef een beschrijving/)).toBeInTheDocument();
    });
    expect(api.reportFraud).not.toHaveBeenCalled();
  });
});
