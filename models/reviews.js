/////////////////////////
// Mongoose
/////////////////////////
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/////////////////////////
// Schema
/////////////////////////
const ReviewsSchema = new Schema({
    body: String,
    rating: Number
})


/////////////////////////
// Exportar Modelo
/////////////////////////
module.exports = mongoose.model('Review', ReviewsSchema);