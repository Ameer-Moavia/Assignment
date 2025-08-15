const { prisma } = require('../prisma/client');

// Create event (ADMIN only)
const createEvent = async (req, res) => {
  try {
    const {
      title, description, type,
      venue, joinLink, contactInfo,
      totalSeats, requiresApproval, joinQuestions,
      startDate, endDate,
      attachments // [{url, type}]
    } = req.body;

    if (!title || !description || !type || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['ONSITE','ONLINE'].includes(type)) {
      return res.status(400).json({ error: 'type must be ONSITE or ONLINE' });
    }

    // Find or create organizer profile for this admin
    let organizer = await prisma.organizerProfile.findUnique({ where: { userId: req.user.id } });
    if (!organizer) {
      const defaultName = (req.user.email || 'organizer');
      organizer = await prisma.organizerProfile.create({
        data: { userId: req.user.id, name: defaultName }
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type,
        venue: venue || null,
        joinLink: joinLink || null,
        contactInfo: contactInfo || null,
        totalSeats: totalSeats ?? null,
        requiresApproval: !!requiresApproval,
        joinQuestions: joinQuestions || undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        organizerId: organizer.id,
        attachments: attachments?.length
          ? { create: attachments.map(a => ({ url: a.url, type: a.type === 'VIDEO' ? 'VIDEO' : 'IMAGE' })) }
          : undefined
      },
      include: { attachments: true, organizer: true }
    });

    res.status(201).json(event);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update event (ADMIN)
const updateEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    delete data.attachments; // manage attachments via separate endpoints if needed

    const updated = await prisma.event.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete event (ADMIN)
const deleteEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.event.delete({ where: { id } });
    res.json({ message: 'Event deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// List events (public; filter: status=active|past; search; pagination)
const listEvents = async (req, res) => {
  try {
    const { status = 'active', page = '1', pageSize = '10', search = '' } = req.query;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(50, Math.max(1, parseInt(pageSize)));

    const now = new Date();
    const where = {
      AND: [
        search ? {
          OR: [
            { title: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } }
          ]
        } : {},
        status === 'active' ? { endDate: { gte: now } } :
        status === 'past'   ? { endDate: { lt:  now } } : {}
      ]
    };

    const [total, items] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip: (p - 1) * ps,
        take: ps,
        include: {
          organizer: { select: { id: true, name: true } },
          _count: { select: { participants: { where: { status: 'CONFIRMED' } } } }
        }
      })
    ]);

    res.json({
      page: p, pageSize: ps, total,
      items: items.map(e => ({
        ...e,
        confirmedParticipants: e._count.participants
      }))
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single event (public)
const getEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const e = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true } },
        attachments: true,
        _count: { select: { participants: { where: { status: 'CONFIRMED' } } } }
      }
    });
    if (!e) return res.status(404).json({ error: 'Event not found' });
    res.json({ ...e, confirmedParticipants: e._count.participants });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Join event (authenticated user; uses ParticipantProfile)
const joinEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.id;
    const { answers } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { participantProfile: true }
    });
    if (!user || !user.participantProfile) {
      return res.status(400).json({ error: 'Participant profile required' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { participants: { where: { status: 'CONFIRMED' } } } }
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const now = new Date();
    if (event.endDate < now) return res.status(400).json({ error: 'Event already finished' });

    // capacity check applies if auto-confirm (no approval)
    const confirmedCount = event._count.participants;
    const seatsFull = event.totalSeats != null && confirmedCount >= event.totalSeats;

    const exists = await prisma.eventParticipant.findUnique({
      where: { eventId_participantId: { eventId, participantId: user.participantProfile.id } }
    });
    if (exists) return res.status(409).json({ error: 'Already joined' });

    if (!event.requiresApproval && seatsFull) {
      return res.status(400).json({ error: 'No seats available' });
    }

    const status = event.requiresApproval ? 'PENDING' : 'CONFIRMED';

    const row = await prisma.eventParticipant.create({
      data: {
        eventId,
        participantId: user.participantProfile.id,
        status,
        answers: answers || undefined
      }
    });

    res.status(201).json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve participant (ADMIN)
const approveParticipant = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const partRowId = Number(req.params.pid);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { participants: { where: { status: 'CONFIRMED' } } } }
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.totalSeats != null && event._count.participants >= event.totalSeats) {
      return res.status(400).json({ error: 'No seats available' });
    }

    const updated = await prisma.eventParticipant.update({
      where: { id: partRowId },
      data: { status: 'CONFIRMED' }
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// List participants of an event (ADMIN)
const listParticipants = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const list = await prisma.eventParticipant.findMany({
      where: { eventId },
      include: {
        participant: {
          include: {
            user: { select: { id: true, email: true } }
          }
        }
      }
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  listEvents,
  getEvent,
  joinEvent,
  approveParticipant,
  listParticipants
};
