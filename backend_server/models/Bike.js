const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  billBookImage: [String],
  bikeImage: [String],
  brand: String,
  bike_name: String,
  year_of_purchase: Number,
  cc: Number,
  kms_driven: Number,
  owner: String,
  servicing: String,
  engine_condition: String,
  physical_condition: String,
  tyre_condition: String,
  price: Number,
  description:String,
  district:String,
  listedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Bike', bikeSchema);
