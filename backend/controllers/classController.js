const Class = require('../models/Class');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({});
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Public
const getClassById = async (req, res) => {
  try {
    const singleClass = await Class.findById(req.params.id);
    if (singleClass) {
      res.json(singleClass);
    } else {
      res.status(404).json({ message: 'Class not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = async (req, res) => {
  try {
    const { title, description, category, type, duration, price, image, status } = req.body;

    const newClass = new Class({
      title,
      description,
      category,
      type,
      duration,
      price,
      image: image || '/tarot.png',
      status: status || 'Active',
    });

    const createdClass = await newClass.save();
    res.status(201).json(createdClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = async (req, res) => {
  try {
    const { title, description, category, type, duration, price, image, status } = req.body;

    const existingClass = await Class.findById(req.params.id);

    if (existingClass) {
      existingClass.title = title || existingClass.title;
      existingClass.description = description || existingClass.description;
      existingClass.category = category || existingClass.category;
      existingClass.type = type || existingClass.type;
      existingClass.duration = duration || existingClass.duration;
      existingClass.price = price !== undefined ? price : existingClass.price;
      existingClass.image = image || existingClass.image;
      existingClass.status = status || existingClass.status;

      const updatedClass = await existingClass.save();
      res.json(updatedClass);
    } else {
      res.status(404).json({ message: 'Class not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = async (req, res) => {
  try {
    const existingClass = await Class.findById(req.params.id);

    if (existingClass) {
      await Class.deleteOne({ _id: existingClass._id });
      res.json({ message: 'Class removed' });
    } else {
      res.status(404).json({ message: 'Class not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
