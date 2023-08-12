const multer = require('multer');
const path = require('path');
const sharp = require('sharp')
// Destination to store image
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = '';

    if (req.baseUrl.includes('users')) {
      folder = 'users';
    } else if (req.baseUrl.includes('photos')) {
      folder = 'photos';
    } else if (req.baseUrl.includes('stories')){
      folder = 'stories'
    }

    cb(null, `uploads/${folder}/`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      // upload only png and jpg formats
      return cb(new Error('Por favor, envie apenas fotos com extensão png, jpg ou jpeg'));
    }
    cb(undefined, true);
  },
});
// Middleware para redimensionar e comprimir a imagem
const resizeAndCompressImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const width = 350;
  const height = 700;
  const quality = 80;
  const fillColor = '#FFFFFF'; // cor de fundo para preencher as áreas adicionais

  sharp(filePath)
    .resize(width, height, {
      fit: 'fill', // ajuste a imagem para caber dentro do tamanho especificado
      background: fillColor, // cor de fundo para preencher as áreas adicionais
    })
    .extend({
      top: Math.round(Math.max(0, (height - width * 0.75) / 2)), // calcula o preenchimento superior necessário
      bottom:  Math.round(Math.max(0, (height - width * 0.75) / 2)), // calcula o preenchimento inferior necessário
      left:  Math.round(Math.max(0, (width - height * 0.75) / 2)), // calcula o preenchimento esquerdo necessário
      right:  Math.round(Math.max(0, (width - height * 0.75) / 2)), // calcula o preenchimento direito necessário
      background: fillColor, // cor de fundo para preencher as áreas adicionais
    })
    .jpeg({ quality: quality })
    .toBuffer()
    .then((buffer) => {
      req.file.buffer = buffer;
      next();
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send({ message: 'Erro ao redimensionar e comprimir a imagem.' });
    });
};

module.exports = {
  imageUpload,
  resizeAndCompressImage,
};