const { prisma } = require('../prisma/client');

// List users (ADMIN only)
const listUsers = async (req, res) => {
  const users = await prisma.user.findAll?.(); // wrong method guard
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, role: true, createdAt: true,
        organizerProfile: { select: { id: true, name: true } },
        participantProfile: { select: { id: true, name: true } }
      }
    });
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update role (ADMIN only)
// If changing to ADMIN: ensure an OrganizerProfile exists
// If changing to PARTICIPANT: ensure a ParticipantProfile exists
const updateRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    if (!['ADMIN','PARTICIPANT'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });

    if (role === 'ADMIN') {
      const op = await prisma.organizerProfile.findUnique({ where: { userId: id } });
      if (!op) {
        // use email prefix as default name
        const defaultName = user.email.split('@')[0];
        await prisma.organizerProfile.create({ data: { userId: id, name: defaultName } });
      }
    } else if (role === 'PARTICIPANT') {
      const pp = await prisma.participantProfile.findUnique({ where: { userId: id } });
      if (!pp) {
        const defaultName = user.email.split('@')[0];
        await prisma.participantProfile.create({ data: { userId: id, name: defaultName } });
      }
    }

    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { listUsers, updateRole };
