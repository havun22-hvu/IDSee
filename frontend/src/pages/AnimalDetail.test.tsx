import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AnimalDetail } from './AnimalDetail';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: { getAnimal: vi.fn() },
}));

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/animals/${id}`]}>
      <Routes>
        <Route path="/animals/:id" element={<AnimalDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AnimalDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the animal details once loaded', async () => {
    (api.getAnimal as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'a1',
      species: 'Hond',
      breed: 'Labrador',
      status: 'CONFIRMED',
      motherKnown: true,
      registeredAt: '2026-01-01T00:00:00.000Z',
      txHash: 'demo_tx_abc',
    });

    renderAt('a1');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Labrador/ })).toBeInTheDocument();
    });
    expect(api.getAnimal).toHaveBeenCalledWith('a1');
    // Blockchain section renders the tx hash when present.
    expect(screen.getByText('demo_tx_abc')).toBeInTheDocument();
  });

  it('shows an error when the animal cannot be loaded', async () => {
    (api.getAnimal as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Dier niet gevonden'));

    renderAt('missing');

    await waitFor(() => {
      expect(screen.getByText('Dier niet gevonden')).toBeInTheDocument();
    });
  });
});
