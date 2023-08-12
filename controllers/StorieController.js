const Photo = require('../models/Photo')
const User = require('../models/User')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');
const { imageUpload, resizeAndCompressImage } = require('../middlewares/imagemUpload')


      const postStories = async (req, res) => {
        try {
          const reqUser = req.user;
          const user = await User.findById(reqUser._id);
      
          // Get the uploaded file
          const storyFile = req.file;
      
          // Check if a file was uploaded
          if (!storyFile) {
            res.status(400).json({ errors: ['É preciso enviar um arquivo'] });
            return;
          }
      
          // Calculate the expiration date for the story
          const expirationDate = new Date();
           expirationDate.setHours(expirationDate.getHours() + 24);
      
          // Create a new story with an Id and expirationDate field
          const newStory = {
            Id: uuidv4(), // Add unique ID field
            storyImage: storyFile.filename,
            userName: user.name,
            userImage: user.profileImage,
            expirationDate,
            userId: user.id
          };
      
          // Add the new story to the user's stories array
          user.stories.push(newStory);
          await user.save();
      
          // Save the story
      
          // Send a success response
          res.status(200).json({
            story: newStory,
            message: 'História adicionada.'
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ errors: ['Erro interno do servidor'] });
        }
      };

      const deleteStory = async (req, res) => {
        const { id } = req.params;
        const reqUser = req.user;
      
        try {
          const user = await User.findById(reqUser._id);
      
          // Find the story in the user's stories array
          const storyIndex = user.stories.findIndex((story) => {
            return story.Id === id;
        });
      
          // Check if the story was found
          if (storyIndex === -1) {
            res.status(404).json({ errors: ['História não encontrada'] });
            return;
          }
      
          // Remove the story from the user's stories array
          const story = user.stories[storyIndex];
          user.stories.splice(storyIndex, 1);
          await user.save();
      
          // Send a success response
          res.status(200).json({ id: story.Id, message: 'História removida.' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ errors: ['Erro interno do servidor'] });
        }
      };

      const getUserStories = async (req, res) => {
        const { id } = req.params;
        const reqUser = req.user;
      
        try {
          const user = await User.findById(id);

          // Check if user exists
          if (!user) {
            res.status(404).json({ errors: ["Usuário não encontrado"] });
            return;
          }

          // Get the user's stories
          const stories = user.stories;
          // Check if the stories array is empty
          if (stories.length === 0) {
            res.status(200).json({ message: "Nenhuma história para ver." });
            return;
          }

          // Send a success response
          res.status(200).json(stories);
        } catch (error) {
          console.error(error);
          res.status(500).json({ errors: ['Erro interno do servidor'] });
        }
      };

      const getAllStories = async (req, res) => {
        try {
          // Find all users
          const users = await User.find();
      
          // Create an array to store all stories
          let allStories = [];
      
          // Loop through each user and add their stories to the allStories array
          for (let user of users) {
            allStories = allStories.concat(user.stories);
          }
      
          // Send a success response with all stories
          res.status(200).json({ stories: allStories });
        } catch (error) {
          console.error(error);
          res.status(500).json({ errors: ['Erro interno do servidor'] });
        }
      };
      

      
      
      
      

module.exports = {
    postStories,
    deleteStory,
    getUserStories,
    getAllStories
}