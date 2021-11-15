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
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})


/////////////////////////
// Exportar Modelo
/////////////////////////
module.exports = mongoose.model('Review', ReviewsSchema);