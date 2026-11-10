const AreaParkir = require('../models/AreaParkirModel');

exports.create = async (req, res) => {
  try {
    const areaParkir = await AreaParkir .create(req.body);
    res.status(201).json(areaParkir );
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  res.json(await AreaParkir .find());
};