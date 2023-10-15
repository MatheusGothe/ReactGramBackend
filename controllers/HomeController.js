const Photo = require('../models/Photo')
const User = require('../models/User')
const mongoose = require('mongoose')

const LoadHome = async(req,res) => {
    console.log('caiu')
    try {
        // Find all users
        const users = await User.find();
    
        // Create an array to store all stories
        let allStories = [];
    
        // Loop through each user and add their stories to the allStories array
        for (let user of users) {
          allStories = allStories.concat(user.stories);
        }
    
        // Find all photos and sort them by createdAt in descending order
        const photos = await Photo.find({}).sort([['createdAt', -1]]).exec()

        // Send a success response with all stories and photos
        res.status(200).json({ stories: allStories, photos: photos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: ['Erro interno do servidor'] });
    }
}

module.exports ={
    LoadHome
}
