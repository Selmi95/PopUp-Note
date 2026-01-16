const User = require('../models/User');
const Note = require('../models/Note');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    const usersWithNoteCount = await Promise.all(users.map(async (user) => {
      const noteCount = await Note.countByUserId(user.id);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        noteCount,
        createdAt: user.created_at
      };
    }));

    res.json(usersWithNoteCount);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }

    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    await User.updateStatus(user.id, newStatus);

    res.json({ message: `User account ${newStatus}`, status: newStatus });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await User.delete(user.id);

    res.json({ message: 'User and associated notes deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
