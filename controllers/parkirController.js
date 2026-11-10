const Parkir = require('../models/ParkirModel');
const AreaParkir = require('../models/AreaParkirModel');
const { errorHttp } = require('../middlewares/errorHandler');

const LIMIT_DEFAULT = 10;
const LIMIT_MAKS = 50;
const FIELD_SORT = ['nama', 'nopol', 'createdAt' ];
const FIELD_BOLEH_DIPILIH = ['noTiket', 'nopol', 'tarif', 'jenis', 'waktu', 'areaParkirId', 'createdAt'];

// Mengubah bilangan dari query string menjadi bilangan bulat yang aman
function angkaAman(nilai, bawaan, min, maks) {
  const n = parseInt(nilai, 10);
  if (Number.isNaN(n)) return bawaan;
  return Math.min(Math.max(n, min), maks);
}

exports.create = async (req, res) => {
  try {
    const parkir = await Parkir.create(req.body);
    res.status(201).json(parkir);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  const filter = {};
  
  // Filter berdasarkan jenis (contoh: ?jenis=mobil) sesuai ketentuan gambar
  if (req.query.jenis) {
    filter['jenis'] = String(req.query.jenis);
  }

  const page = angkaAman(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
  const limit = angkaAman(req.query.limit, LIMIT_DEFAULT, 1, LIMIT_MAKS);

  // Sorting: ?sort=nopol (naik) atau ?sort=-createdAt (turun). Bawaan: terbaru dulu
  const sortParam = String(req.query.sort || '-createdAt');
  const arah = sortParam.startsWith('-') ? -1 : 1;
  const sortField = sortParam.replace(/^-/, '');
  if (!FIELD_SORT.includes(sortField)) {
    throw errorHttp(400, `sort hanya boleh: ${FIELD_SORT.join(', ')}`);
  }

  // Projection: ?fields=noTiket,nopol
  let select = '';
  if (req.query.fields) {
    const fields = String(req.query.fields).split(',').map((f) => f.trim());
    if (!fields.every((f) => FIELD_BOLEH_DIPILIH.includes(f))) {
      throw errorHttp(400, `fields hanya boleh: ${FIELD_BOLEH_DIPILIH.join(', ')}`);
    }
    select = fields.join(' ');
  }

  const query = Parkir.find(filter)
    .select(select)
    .sort({ [sortField]: arah, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // populate() dipanggil ke field 'areaParkirId' (sesuai skema & gambar)
  if (!select || select.split(' ').includes('areaParkirId')) {
    query.populate('areaParkirId', 'kode nama');
  }

  // Perbaikan typo: Parkir.countDocuments (sebelumnya lowercase 'parkir')
  const [data, total] = await Promise.all([query, Parkir.countDocuments(filter)]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
};

exports.getById = async (req, res) => {
  // Populate menggunakan nama field 'areaParkirId'
  const data = await Parkir.findById(req.params.id).populate('areaParkirId', 'kode nama');
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.json(data);
};

exports.update = async (req, res) => {
  // Perbaikan typo: Parkir.findByIdAndUpdate (sebelumnya lowercase 'parkir')
  const data = await Parkir.findByIdAndUpdate(
    req.params.id,
    req.body,
    { returnDocument: 'after', runValidators: true }
  );
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await Parkir.findByIdAndDelete(req.params.id);
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.status(204).send();
};