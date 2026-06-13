import type { Request, Response, NextFunction } from 'express';
import {
  generateToken,
  authMiddleware,
  requireRole,
  adminOnly,
  AuthRequest,
} from '../src/middleware/auth.js';

// Minimal Express res double that records status + json calls.
function mockRes() {
  const res: Partial<Response> & { statusCode?: number; body?: any } = {};
  res.status = ((code: number) => {
    res.statusCode = code;
    return res as Response;
  }) as Response['status'];
  res.json = ((payload: any) => {
    res.body = payload;
    return res as Response;
  }) as Response['json'];
  return res as Response & { statusCode?: number; body?: any };
}

const payload = { userId: 'user-1', email: 'admin@idsee.nl', role: 'ADMIN' };

describe('generateToken + authMiddleware', () => {
  it('accepts a freshly signed token and sets userId/role', () => {
    const token = generateToken(payload as any);
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe('user-1');
    expect(req.userRole).toBe('ADMIN');
  });

  it('rejects a request without an Authorization header', () => {
    const req = { headers: {} } as AuthRequest;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it('rejects a malformed/invalid token', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } } as AuthRequest;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });
});

describe('requireRole', () => {
  it('allows a user whose role is in the allow-list', () => {
    const req = { userRole: 'BREEDER' } as AuthRequest;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole(['BREEDER', 'VET'])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('blocks a user whose role is not allowed', () => {
    const req = { userRole: 'BUYER' } as AuthRequest;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole(['BREEDER', 'VET'])(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });
});

describe('adminOnly', () => {
  it('allows admins', () => {
    const req = { userRole: 'ADMIN' } as AuthRequest;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    adminOnly(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('blocks non-admins', () => {
    const req = { userRole: 'BREEDER' } as AuthRequest;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    adminOnly(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });
});
