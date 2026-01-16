const Note = require('../models/Note');
const { validateNoteInput } = require('../utils/validation');
const { encrypt, decrypt } = require('../utils/encryption');

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.findByUserId(req.user.id);

    const decryptedNotes = notes.map(note => {
      return {
        id: note.id,
        title: note.title,
        content: decrypt(note.content, req.user.encryption_key),
        createdAt: note.created_at
      };
    });

    res.json(decryptedNotes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createNote = async (req, res) => {
  const { errors, isValid } = validateNoteInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { title, content } = req.body;

  try {
    const encryptedContent = encrypt(content, req.user.encryption_key);

    const note = await Note.create({
      userId: req.user.id,
      title,
      content: encryptedContent
    });

    res.json({
      id: note.id,
      title: note.title,
      content: content,
      createdAt: note.created_at
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateNote = async (req, res) => {
  const { title, content } = req.body;

  try {
    const noteId = parseInt(req.params.id);
    let note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.user_id !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const encryptedContent = encrypt(content, req.user.encryption_key);

    note = await Note.update(noteId, { title, content: encryptedContent });

    res.json({
      id: note.id,
      title: note.title,
      content: content,
      createdAt: note.created_at
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.user_id !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    await Note.delete(noteId);

    res.json({ message: 'Note removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
