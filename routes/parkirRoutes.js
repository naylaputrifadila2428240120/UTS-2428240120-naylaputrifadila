const express = require('express');
const router = express.Router();
const parkirController = require('../controllers/parkirController');
const cekApiKey = require('../middlewares/cekApiKey');

router.get('/', parkirController.getAll);
router.get('/:id', parkirController.getById);
router.post('/', cekApiKey, parkirController.create);
router.put('/:id', cekApiKey, parkirController.update);
router.delete('/:id', cekApiKey, parkirController.remove);

module.exports = router;