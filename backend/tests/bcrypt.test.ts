import bcrypt from 'bcrypt';

// Guards the password hashing used by /auth (register + login) after the
// bcrypt v6 upgrade — the API must still hash and verify correctly.
describe('bcrypt password hashing', () => {
  it('hashes and verifies a correct password', async () => {
    const hash = await bcrypt.hash('s3cret-pw', 10);
    expect(hash).not.toBe('s3cret-pw');
    expect(await bcrypt.compare('s3cret-pw', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await bcrypt.hash('s3cret-pw', 10);
    expect(await bcrypt.compare('wrong', hash)).toBe(false);
  });
});
