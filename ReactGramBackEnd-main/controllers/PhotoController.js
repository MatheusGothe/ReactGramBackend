const Photo = require('../models/Photo')
const User = require('../models/User')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');
const { imageUpload, resizeAndCompressImage } = require('../middlewares/imagemUpload')

// Insert a photo, with a user related to itconst
  const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  // Create photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
    profileImage: user.profileImage
  });

  // If photo was created successfully, return data
  if (!newPhoto) {
    res.status(422).json({ errors: ['Houve um problema, por favor tente novamente mais tarde.'] });
    return;
  }

  res.status(201).json(newPhoto)

}

// Remove photo from db
    const deletePhoto  = async(req,res) => {
        const {id} = req.params

        const reqUser = req.user

        try{
            const photo = await Photo.findById(new mongoose.Types.ObjectId(id))

        // Check if photo exists
        if(!photo){
            res.status(404).json({errors: ['Foto não encontrada!']})
            return
        }

        // Check if photo belongs to user
        if(!photo.userId.equals(reqUser._id)){
            res.status(422).json({errors: ['Esta foto não é sua para você apagar.']})
        }
        await Photo.findByIdAndDelete(photo._id)

        res.status(200).json({id: photo._id, message: 'Foto excluída com sucesso'})
        }catch(error){
            res.status(404).json({errors: ['Foto não encontrada!']})
            return

        }
    }
// Get all photos
    const getAllPhotos = async(req,res) => {
        const photos = await Photo.find({}).sort([['createdAt', -1]]).exec()

        return res.status(200).json(photos)
    }

// Get user photos
    const getUserPhotos = async(req,res) => {

        const {id} = req.params
    
        const photos = await Photo.find({userId: id})
            .sort([['createdAt',-1]])
            .exec()

        return res.status(200).json(photos)

    }    
// Get photo by ID
    const getPhotoById = async(req,res) => {

        const {id} = req.params
        try{
            const photo = await Photo.findById(new mongoose.Types.ObjectId(id))
            res.status(200).json(photo)
            if(!photo){
                res.status(404).json({errors: ['Foto não encontrada']})
                return
            }
    
        }catch(error){
            res.status(404).json({errors: ['Foto não encontrada']})
    
        }
    }
    // Update a photo
    const updatePhoto = async(req,res) => {
        const {id} = req.params
        const {title} = req.body

        const reqUser = req.user

        const photo = await Photo.findById(id)

        // check if photo exists
        if(!photo){
            res.status(404).json({errors: ['Foto não encontrada']})
            return
        }

        // check if photo belongs to user
        if(!photo.userId.equals(reqUser._id)){
            res.status(422).json({errors: ['A foto não é sua para você atualizar.']})
            return
        }

        if(title){
            photo.title = title
            return
        }

        await photo.save()

        res.status(200).json({photo, message: 'Foto atualizada com sucesso'})

    }

    // Like
    const likePhoto = async(req,res) => {

        const {id} = req.params

        const reqUser = req.user 

        const photo = await Photo.findById(id)

        console.log(reqUser)
        // Check if photo exists
        if(!photo){
            res.status(404).json({errors: ['Foto não encontrada']})
            return
        }

        // Check if user already like the photo
        if(photo.likes.includes(reqUser._id)){
            res.status(422).json({errors: ['Você já curtiu a foto.']})
            return
        }

       

        // Put user id in likes array
        photo.likes.push(reqUser._id)

        photo.save()

        res
          .status(200)
          .json({
            photoId: id,
            userId: reqUser._id,
            name: reqUser.name,
            profileImage: reqUser.profileImage,
            message: "A foto foi curtida.",
          });

    }
    const removeLike = async (req, res) => {
        const { id } = req.params;
        const reqUser = req.user;
        let photo;
      
        try {
          photo = await Photo.findById(id);
      
          if (!photo) {
            res.status(404).json({ errors: ['Foto não encontrada'] });
            return;
          }
      
          if (!photo.likes.includes(reqUser._id)) {
            res.status(422).json({ errors: ['Você ainda não curtiu a foto'] });
            return;
          }
      
          photo.likes = photo.likes.filter((userId) => !userId.equals(reqUser._id));
      
          await photo.save();
      
          res.status(200).json({ photo, message: 'Curtida removida com sucesso' });
        } catch (error) {
          res.status(404).json({ errors: ['Foto não encontrada'] });
        }
      };
      // Comment 
      const commentPhoto = async(req,res) => {
        const {id} = req.params
        const {comment} = req.body
        const reqUser = req.user
        const user = await User.findById(reqUser._id);
        const photo = await Photo.findById(id);
  
        // Check if photo exists
        if (!photo) {
          res.status(404).json({ errors: ["Foto não encontrada"] });
          return;
        }

        if(!comment || comment.trim().length === 0){
          res.status(400).json({ errors: ['Comentário não pode estar vazio.']})
          return
         }
         
      
        // Put comment in the array of comments
        const userComment = {
          CommentId: uuidv4(), // Add unique ID field
          comment,
          userName: user.name,
          userImage: user.profileImage,
          userId: user._id
        }
      
        photo.comments.push(userComment)
        await photo.save()
      
        res.status(200).json({
          comment: userComment,
          message: 'Comentário adicionado.'
        })
      
      }
      const removeCommentPhoto = async (req, res) => {
        const { id, commentId } = req.params;
        const reqUser = req.user;
        const user = await User.findById(reqUser._id);
        const photo = await Photo.findById(id);
      
      
      //  console.log("Id do dono da foto",)
        // Check if photo exists
        if (!photo) {
          return res.status(404).json({ errors: ["Foto não encontrada"] });
        }
      
        let commentIndex = -1;
        photo.comments.forEach((comment, index) => {
          if (comment.CommentId === commentId) {
            commentIndex = index;
          }
        });
    
        if (commentIndex === -1) {
          return res.status(404).json({ errors: ["Comentário não encontrado"] });
        }
        if (
          !(
            user._id.toString() ===
              photo.comments[commentIndex].userId.toString() ||
            user._id.toString() === photo.userId.toString()
          )
        ) {
          return res
            .status(401)
            .json({
              errors: ["Você não tem permissão para remover este comentário"],
            });
        }
    

        photo.comments.splice(commentIndex, 1);
      
        await photo.save();
      
        return res.json({ message: "Comentário removido com sucesso" });
      };
      
      
      
      // Searc photos by title
      const searchPhotos = async(req,res) => {

        const {q} = req.query 

        try {
          
          const photos = await Photo.find({ title: new RegExp(q, "i" )}).exec()
          const user = await User.find({ name: new RegExp(q, "i" )}).exec()  

          res.status(200).json([photos,user])
        } catch (error) {
          console.log(error)
        }
      }

      const getPhotoLikes = async (req, res) => {

        const { photoId } = req.params;
        const reqUser = req.user;
        const user = await User.findById(reqUser._id);

        try {
          let photo = await Photo.findById(photoId);

          if (!photo) {
            res.status(404).json({ errors: ['Foto não encontrada'] });
            return;
          }
        
            const users = await User.find({ _id: { $in: photo.likes } }, 'name _id profileImage followers following');
            res.status(200).json({users,user});
        
          
        } catch (error) {
          console.error(error);
          res.status(500).json({ errors: ['Erro interno do servidor'] });
        }
      };

 

module.exports = {
    insertPhoto,  
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    removeLike,
    likePhoto,
    commentPhoto,
    removeCommentPhoto,
    searchPhotos,
    getPhotoLikes,
}