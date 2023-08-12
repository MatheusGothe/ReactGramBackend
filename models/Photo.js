const mongoose = require('mongoose')
const {Schema} = mongoose 

const sharp = require('sharp')
const photoSchema = new Schema({
    image: String,
    title: String,
    likes: Array,
    comments: Array,
    userId: mongoose.ObjectId,
    userName: String,
    profileImage: String
},{
    timestamps: true
})
/*
// Método para redimensionar a imagem antes de salvar
photoSchema.methods.resizeImage = async function() {
  console.log("Redimensionando imagem...");
    const imagePath = `../../backend/uploads/${this.image}`;
    const resizedImagePath = imagePath.replace(/\.[^/.]+$/, "") + '-resized.jpeg'
    console.log(`Caminho da imagem: ${imagePath}`);
    await sharp(imagePath)
      .resize(250, 250, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(resizedImagePath)
  
    this.image = resizedImagePath
  }
*/
const Photo = mongoose.model('Photo',photoSchema)

module.exports = Photo