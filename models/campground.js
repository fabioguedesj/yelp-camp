/////////////////////////
// Mongoose
/////////////////////////
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/////////////////////////
// Schema
/////////////////////////
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
})


/////////////////////////
// Exportar Modelo
/////////////////////////
module.exports = mongoose.model('Campground', CampgroundSchema);