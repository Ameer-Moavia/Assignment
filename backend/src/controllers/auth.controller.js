const { prisma } = require('../prisma/client');
const {
  hashPassword, comparePassword, makeJWT,
  generateOtp, generateResetToken
} = require('../utils/crypto');
const { sendEmail } = require('../utils/email');

// SIGNUP with password (role: PARTICIPANT or ADMIN)
// If ADMIN: also create OrganizerProfile (so they can create events)
const signup = async (req, res) => {
  try {
    const { email, password, role = 'PARTICIPANT', name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'name, email, password required' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role,
        organizerProfile: role === 'ADMIN' ? { create: { name } } : undefined,
        participantProfile: role === 'PARTICIPANT' ? { create: { name } } : undefined
      },
      include: { organizerProfile: true, participantProfile: true }
    });

    const token = makeJWT({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// LOGIN with password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = makeJWT({ id: user.id, email: user.email, role: user.role });
    res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// SEND OTP (purpose: LOGIN or SIGNUP)
async function sendOtp(req, res) {
  const { email, purpose } = req.body;

  if (!email || !purpose) {
    return res.status(400).json({ error: 'Email and purpose required' });
  }

  const otp = generateOtp(); // 6-digit code
  const expiresAt = new Date(Date.now() + process.env.OTP_TTL_MINUTES * 60 * 1000); 

  await prisma.oTP.create({
    data: { email, code: otp, purpose, expiresAt }
  });

  const subject = 'Your OTP Code';
  const text = `Your OTP is: ${otp}. It will expire in 5 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="color: #4A90E2;">Your OTP Code</h2>
      <p>Hi there,</p>
      <p>Your one-time password is:</p>
      <h1 style="color: #333;">${otp}</h1>
      <p>This code will expire in <strong>${process.env.OTP_TTL_MINUTES} minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail(email, subject, text, html);

  res.json({ message: 'OTP sent to email' });
}


// VERIFY OTP (LOGIN or SIGNUP)
// If no user exists, create PARTICIPANT with participantProfile
const verifyOtp = async (req, res) => {
  try {
    const { email, code, name } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'email & code required' });

    const otp = await prisma.oTP.findFirst({
      where: { email, code, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { id: 'desc' }
    });
    if (!otp) return res.status(400).json({ error: 'Invalid or expired OTP' });

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Signup via OTP => default PARTICIPANT
      user = await prisma.user.create({
        data: {
          email,
          role: 'PARTICIPANT',
          participantProfile: { create: { name: name || email.split('@')[0] } }
        }
      });
    }

    // mark OTP used
    await prisma.oTP.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    const token = makeJWT({ id: user.id, email: user.email, role: user.role });
    res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// REQUEST PASSWORD RESET
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: 'If email exists, a reset will be sent' });

    const ttl = Number(process.env.RESET_TTL_MINUTES || 60);
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt }
    });

    // In production: send by email. Dev: return it.
    res.json({ message: 'Reset token generated (dev only returns it)', token, expiresAt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'token & newPassword required' });

    const record = await prisma.passwordResetToken.findFirst({
      where: { token, usedAt: null, expiresAt: { gt: new Date() } }
    });
    if (!record) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashed = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
    ]);

    res.json({ message: 'Password updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
  sendOtp,
  verifyOtp,
  requestPasswordReset,
  resetPassword
};
