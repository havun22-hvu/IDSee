import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Verify } from './Verify';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    initiateCheck: vi.fn(),
    getCheckStatus: vi.fn(),
    getCheckResult: vi.fn(),
  },
}));

const greenResult = {
  chipId: '',
  riskScore: 'GROEN' as const,
  factors: {
    found: true,
    chainConfirmed: true,
    breederVerified: true,
    motherKnown: true,
    disputed: false,
  },
};

describe('Verify (paid flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/verify');
  });

  it('shows the €2 price on the button', () => {
    render(<Verify />);
    expect(screen.getByRole('button', { name: /Verifieer \(€2\)/ })).toBeInTheDocument();
  });

  it('runs the demo flow: initiate → poll PAID → show score', async () => {
    (api.initiateCheck as ReturnType<typeof vi.fn>).mockResolvedValue({
      sessionId: 's1',
      checkoutUrl: null,
    });
    (api.getCheckStatus as ReturnType<typeof vi.fn>).mockResolvedValue({ status: 'PAID' });
    (api.getCheckResult as ReturnType<typeof vi.fn>).mockResolvedValue(greenResult);

    render(<Verify />);
    fireEvent.change(screen.getByLabelText('Chipnummer'), {
      target: { value: '528000000000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Verifieer/ }));

    await waitFor(() => {
      expect(screen.getByText('Groen')).toBeInTheDocument();
    });
    expect(api.initiateCheck).toHaveBeenCalledWith('528000000000000');
    expect(api.getCheckResult).toHaveBeenCalledWith('s1');
  });

  it('surfaces a failed payment', async () => {
    (api.initiateCheck as ReturnType<typeof vi.fn>).mockResolvedValue({
      sessionId: 's2',
      checkoutUrl: null,
    });
    (api.getCheckStatus as ReturnType<typeof vi.fn>).mockResolvedValue({ status: 'FAILED' });

    render(<Verify />);
    fireEvent.change(screen.getByLabelText('Chipnummer'), {
      target: { value: '528000000000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Verifieer/ }));

    await waitFor(() => {
      expect(screen.getByText(/Betaling mislukt/)).toBeInTheDocument();
    });
  });
});
