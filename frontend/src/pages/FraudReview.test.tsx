import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FraudReview } from './FraudReview';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    getPendingFraudReports: vi.fn(),
    confirmFraud: vi.fn(),
    rejectFraud: vi.fn(),
  },
}));

const report = {
  id: 'r1',
  reporterId: 'u9',
  subjectUserId: 'u2',
  type: 'omgekat_paspoort',
  description: 'Buitenlands paspoort zonder traceerbare bron',
  status: 'PENDING_VET_REVIEW' as const,
  createdAt: '2026-06-01T00:00:00.000Z',
};

describe('FraudReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists pending signals', async () => {
    (api.getPendingFraudReports as ReturnType<typeof vi.fn>).mockResolvedValue([report]);

    render(<FraudReview />);

    await waitFor(() => {
      expect(screen.getByText('omgekat_paspoort')).toBeInTheDocument();
    });
    expect(screen.getByText(/zonder traceerbare bron/)).toBeInTheDocument();
  });

  it('confirms a signal and shows the new chain status', async () => {
    (api.getPendingFraudReports as ReturnType<typeof vi.fn>).mockResolvedValue([report]);
    (api.confirmFraud as ReturnType<typeof vi.fn>).mockResolvedValue({
      subjectUserId: 'u2',
      newStatus: 'ORANJE',
    });

    render(<FraudReview />);
    await waitFor(() => screen.getByText('omgekat_paspoort'));

    await userEvent.click(screen.getByRole('button', { name: /Bevestigen als fraudesignaal/ }));

    await waitFor(() => {
      expect(api.confirmFraud).toHaveBeenCalledWith('r1', undefined);
      expect(screen.getByText(/ORANJE/)).toBeInTheDocument();
    });
  });

  it('shows an empty state when there are no signals', async () => {
    (api.getPendingFraudReports as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(<FraudReview />);

    await waitFor(() => {
      expect(screen.getByText(/Geen openstaande signalen/)).toBeInTheDocument();
    });
  });
});
