const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadBike } = require('../middlewares/upload');
const { listBike } = require('../controllers/bikeController');
const { updateBike } = require('../controllers/bikeController');
const { showMyListings } = require('../controllers/bikeController');
const { deleteBike } = require('../controllers/bikeController');
const { getResaleBikes, getSingleBike, filterBikes } = require('../controllers/bikeController');



router.post(
  '/list-bike',
  authMiddleware,
  uploadBike.fields([
    { name: 'billBookImage', maxCount: 2 },
    { name: 'bikeImage', maxCount: 2 }
  ]),
  listBike
);

router.post(
  '/list-bike/edit',
  authMiddleware,
  uploadBike.fields([
    { name: 'billBookImage', maxCount: 2 },
    { name: 'bikeImage', maxCount: 2 }
  ]),
  updateBike
);

router.get('/show-my-listings', authMiddleware, showMyListings);

router.delete('/bike-delete', authMiddleware, deleteBike);

router.get('/resale-bikes', getResaleBikes);

router.get('/resale-bikes/:bikeId', getSingleBike);

router.post('/resale-bikes/filters', filterBikes);


module.exports = router;
