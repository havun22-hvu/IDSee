import { Router } from 'express';
import { hashChipId } from '../services/blockchain.js';
import { calculateRiskScore } from '../services/verificationService.js';

const router = Router();

// GET /verify/:chipId - Public endpoint, no auth required.
// Returns a risk score (GROEN/ORANJE/ROOD) expressing verifiability of the
// origin chain — not guilt (zie PROPOSITION.md §3).
router.get('/:chipId', async (req, res) => {
  try {
    const { chipId } = req.params;

    if (!chipId || chipId.length < 10) {
      return res.status(400).json({ error: 'Ongeldig chipnummer' });
    }

    const chipIdHash = hashChipId(chipId);
    const result = await calculateRiskScore(chipIdHash);
    // Echo the buyer's own chip number back (not stored anywhere).
    result.chipId = chipId;

    res.json(result);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verificatie mislukt' });
  }
});

// GET /verify/:chipId/details - For authenticated users with permission
router.get('/:chipId/details', async (req, res) => {
  // TODO: Add auth and permission check
  // This endpoint could return more details for insurance companies, etc.
  res.status(501).json({ error: 'Nog niet geïmplementeerd' });
});

export default router;
