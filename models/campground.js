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
    price: String,
    description: String,
    location: String
})


/////////////////////////
// Exportar Modelo
/////////////////////////
module.exports = mongoose.model('Campground', CampgroundSchema);