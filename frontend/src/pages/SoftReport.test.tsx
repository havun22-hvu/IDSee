import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Verify } from './Verify';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    initiateCheck: vi.fn(),
    getCheckStatus: vi.fn(),
    getCheckResult: vi.fn(),
    reportSoftSignal: vi.fn(),
  },
}));

const greenResult = {
  chipId: '',
  riskScore: 'GROEN' as const,
  factors: { found: true, chainConfirmed: true, breederVerified: true, motherKnown: true, disputed: false },
};

async function reachResult() {
  (api.initiateCheck as ReturnType<typeof vi.fn>).mockResolvedValue({ sessionId: 's1', checkoutUrl: null });
  (api.getCheckStatus as ReturnType<typeof vi.fn>).mockResolvedValue({ status: 'PAID' });
  (api.getCheckResult as ReturnType<typeof vi.fn>).mockResolvedValue(greenResult);

  render(<Verify />);
  fireEvent.change(screen.getByLabelText('Chipnummer'), { target: { value: '528000000000000' } });
  fireEvent.click(screen.getByRole('button', { name: /Verifieer/ }));
  await waitFor(() => screen.getByText('Groen'));
}

describe('buyer soft report on the result page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/verify');
  });

  it('submits a soft signal tied to the session', async () => {
    (api.reportSoftSignal as ReturnType<typeof vi.fn>).mockResolvedValue({ message: 'ok' });
    await reachResult();

    fireEvent.click(screen.getByRole('button', { name: /Klopt er iets niet/ }));
    fireEvent.change(screen.getByLabelText('Beschrijving melding'), {
      target: { value: 'moeder onbekend' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Melding indienen/ }));

    await waitFor(() => {
      expect(screen.getByText(/Een dierenarts beoordeelt je melding/)).toBeInTheDocument();
    });
    expect(api.reportSoftSignal).toHaveBeenCalledWith('s1', 'moeder onbekend');
  });
});
