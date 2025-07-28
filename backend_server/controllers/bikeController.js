const Bike = require('../models/Bike');
const User = require('../models/User');

exports.listBike = async (req, res) => {
  try {
    // console.log("🚀 JWT User ID:", req.userId);
    // console.log("📦 req.body:", req.body);
    // console.log("📸 req.files:", req.files);

    const billBookImages = req.files['billBookImage']?.map(file => file.path);
    const bikeImages = req.files['bikeImage']?.map(file => file.path);

    if (!billBookImages || billBookImages.length > 2) {
      return res.status(400).json({ message: 'Maximum 2 bill book images allowed' });
    }

    if (!bikeImages || bikeImages.length > 2) {
      return res.status(400).json({ message: 'Maximum 2 bike images allowed' });
    }

    const bike = new Bike({
      billBookImage: billBookImages,
      bikeImage: bikeImages,
      brand: req.body.brand,
      bike_name: req.body.bike_name,
      year_of_purchase: parseInt(req.body.year_of_purchase),
      cc: parseInt(req.body.cc),
      kms_driven: parseInt(req.body.kms_driven),
      owner: req.body.owner,
      servicing: req.body.servicing,
      engine_condition: req.body.engine_condition,
      physical_condition: req.body.physical_condition,
      tyre_condition: req.body.tyre_condition,
      price: parseInt(req.body.price),
      description: req.body.description,
      listedBy: req.userId,
      district: req.district
    });

    // console.log("✅ Bike Object Ready:", bike);

    await bike.save(); // This might be throwing!

    // console.log("✅ Bike saved.");

    res.status(201).json({ message: 'Bike listed successfully', bike });

  } catch (err) {
    console.error("❌ Error while listing bike:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



exports.updateBike = async (req, res) => {
  try {
    const { bikeId } = req.body;

    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    // Check ownership
    if (bike.listedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to edit this bike' });
    }

    // Delete old images from Cloudinary
    const deleteOldImages = async (urls = []) => {
      for (const url of urls) {
        const publicId = url.split('/').pop().split('.')[0]; // crude extraction
        try {
          await cloudinary.uploader.destroy(`bike_uploads/${publicId}`);
        } catch (err) {
          console.warn('⚠️ Failed to delete old image:', url, err.message);
        }
      }
    };

    // Replace images
    const newBillBookImages = req.files['billBookImage']?.map(f => f.path);
    const newBikeImages = req.files['bikeImage']?.map(f => f.path);

    if (newBillBookImages) {
      await deleteOldImages(bike.billBookImage);
      bike.billBookImage = newBillBookImages;
    }

    if (newBikeImages) {
      await deleteOldImages(bike.bikeImage);
      bike.bikeImage = newBikeImages;
    }

    // Update other fields
    const fields = [
      'brand', 'bike_name', 'year_of_purchase', 'cc', 'kms_driven',
      'owner', 'servicing', 'engine_condition', 'physical_condition',
      'tyre_condition', 'price','description', 'district'
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        bike[field] = field === 'price' || field === 'cc' || field === 'year_of_purchase' || field === 'kms_driven'
          ? parseInt(req.body[field])
          : req.body[field];
      }
    }

    await bike.save();

    res.status(200).json({ message: 'Bike updated successfully', bike });

  } catch (err) {
    console.error('❌ Error in updateBike:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.showMyListings = async (req, res) => {
  try {
    const userId = req.userId;

    const bikes = await Bike.find({ listedBy: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Your listed bikes',
      count: bikes.length,
      bikes
    });

  } catch (err) {
    console.error('❌ Error in showMyListings:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.deleteBike = async (req, res) => {
  try {
    const userId = req.userId;
    const { bikeId } = req.body;

    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    // Check if this user is the owner
    if (bike.listedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own listing' });
    }

    // Optional: delete images from Cloudinary
    const deleteImages = async (urls = []) => {
      for (const url of urls) {
        const publicId = url.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`bike_uploads/${publicId}`);
        } catch (err) {
          console.warn('⚠️ Failed to delete image from Cloudinary:', url, err.message);
        }
      }
    };

    await deleteImages(bike.billBookImage);
    await deleteImages(bike.bikeImage);

    // Delete from DB
    await Bike.findByIdAndDelete(bikeId);

    res.status(200).json({ message: 'Bike deleted successfully' });

  } catch (err) {
    console.error('❌ Error deleting bike:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getResaleBikes = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const total = await Bike.countDocuments();
    const bikes = await Bike.find({})
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: 'Resale bikes fetched successfully',
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      bikes
    });

  } catch (err) {
    console.error('❌ Error in getResaleBikes:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSingleBike = async (req, res) => {
  try {
    const { bikeId } = req.params;

    const bike = await Bike.findById(bikeId).populate('listedBy', 'fullName email avatar address');

    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    res.status(200).json({
      message: 'Bike details fetched successfully',
      bike
    });

  } catch (err) {
    console.error('❌ Error in getSingleBike:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.filterBikes = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    const filters = req.body;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build query object from non-empty fields in req.body
    const query = {};
    for (const key in filters) {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        // Allow range filters for numeric values
        if (typeof filters[key] === 'object' && (filters[key].min !== undefined || filters[key].max !== undefined)) {
          query[key] = {};
          if (filters[key].min !== undefined) query[key]['$gte'] = filters[key].min;
          if (filters[key].max !== undefined) query[key]['$lte'] = filters[key].max;
        } else {
          query[key] = filters[key];
        }
      }
    }

    const total = await Bike.countDocuments(query);

    const bikes = await Bike.find(query)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: 'Filtered bikes fetched successfully',
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      bikes
    });

  } catch (err) {
    console.error('❌ Error in filterBikes:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
