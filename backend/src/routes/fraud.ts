import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import {
  reportFraud,
  getPendingReports,
  confirmFraud,
  rejectFraud,
  addProfessionalNote,
} from '../services/fraudService.js';

const router = Router();

// Only a verified vet may review or confirm a fraud signal (PROPOSITION.md §4).
function requireVerifiedVet(req: AuthRequest, res: Response, next: NextFunction) {
  const u = req.user;
  if (!u || u.role !== 'VET' || u.verificationStatus !== 'VERIFIED') {
    return res.status(403).json({ error: 'Alleen een geverifieerde dierenarts mag dit beoordelen' });
  }
  next();
}

// A discrepancy note may be recorded by an admin or a verified vet (§3b/§4).
function requireVetOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const u = req.user;
  const isAdmin = u?.role === 'ADMIN';
  const isVerifiedVet = u?.role === 'VET' && u.verificationStatus === 'VERIFIED';
  if (!u || (!isAdmin && !isVerifiedVet)) {
    return res.status(403).json({ error: 'Alleen een admin of geverifieerde dierenarts mag een notitie plaatsen' });
  }
  next();
}

// File a signal — any authenticated user.
router.post('/report', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { type, description, subjectUserId, animalId, chipId } = req.body;
    if (!type || !description) {
      return res.status(400).json({ error: 'Type en beschrijving zijn verplicht' });
    }
    const report = await reportFraud({
      reporterId: req.user!.id,
      type,
      description,
      subjectUserId,
      animalId,
      chipId,
    });
    res.status(201).json({ message: 'Melding ingediend', report });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Kon melding niet indienen' });
  }
});

// Pending signals — verified vet only.
router.get('/pending', authenticateToken, requireVerifiedVet, async (_req: AuthRequest, res: Response) => {
  try {
    res.json(await getPendingReports());
  } catch (error) {
    console.error('Get pending fraud reports error:', error);
    res.status(500).json({ error: 'Kon meldingen niet ophalen' });
  }
});

router.post('/:id/confirm', authenticateToken, requireVerifiedVet, async (req: AuthRequest, res: Response) => {
  try {
    res.json(await confirmFraud(req.params.id, req.user!.id, req.body.note));
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Bevestigen mislukt' });
  }
});

router.post('/:id/reject', authenticateToken, requireVerifiedVet, async (req: AuthRequest, res: Response) => {
  try {
    res.json(await rejectFraud(req.params.id, req.user!.id, req.body.note));
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Afwijzen mislukt' });
  }
});

// Record a verified discrepancy note on a professional (PROPOSITION.md §4).
// Note: the route id param is NOT used here; subject is given in the body.
router.post('/note', authenticateToken, requireVetOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { type, description, subjectUserId, animalId, chipId } = req.body;
    if (!type || !description) {
      return res.status(400).json({ error: 'Type en beschrijving zijn verplicht' });
    }
    const result = await addProfessionalNote({
      createdById: req.user!.id,
      type,
      description,
      subjectUserId,
      animalId,
      chipId,
    });
    res.status(201).json({ message: 'Notitie geregistreerd', ...result });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Kon notitie niet plaatsen' });
  }
});

export default router;
