import { getEmailProvider, sendVerificationEmail } from '../src/services/emailService.js';

describe('emailService (demo provider)', () => {
  it('defaults to the demo provider without EMAIL_PROVIDER', () => {
    expect(getEmailProvider().name).toBe('demo');
  });

  it('sends a verification mail without throwing, logging the token', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await sendVerificationEmail('koper@example.nl', 'tok-123');
    const logged = spy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(logged).toContain('koper@example.nl');
    expect(logged).toContain('tok-123');
    spy.mockRestore();
  });
});
