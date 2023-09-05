const schedule = require('node-schedule');
const User = require('../models/User'); // Importe o modelo de usuário


const deleteExpiredStories = () => {
  // Agende um trabalho para ser executado a cada hora
  schedule.scheduleJob('* * * * *', async () => {
    try {
      // Encontre todos os usuários com histórias expiradas
      const users = await User.find({
        stories: {
          $elemMatch: {
            expirationDate: { $lt: new Date() }
          }
        }
      });
      // Remova as histórias expiradas de cada usuário
      for (const user of users) {
        let expiredIndex;
        while ((expiredIndex = user.stories.findIndex(story => story.expirationDate <= new Date())) !== -1) {
          user.stories.splice(expiredIndex, 1);
        }
        await user.save();
      }
    } catch (error) {
      console.error(error);
    }
  });
}
module.exports = deleteExpiredStories;
