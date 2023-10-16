userSchema.pre('remove', async function(next) {
    // 'this' é o usuário que está sendo removido. Encontre todos os usuários que têm este usuário em seus arrays 'following' e 'followers'.
    const usersFollowing = await this.model('User').find({ following: this._id }, '_id');
    const usersFollowers = await this.model('User').find({ followers: this._id }, '_id');
  
    // Para cada um desses usuários, retire este usuário de seus arrays 'following' e 'followers'.
    const updatesFollowing = usersFollowing.map(user => this.model('User').updateOne({ _id: user._id }, { $pull: { following: this._id } }));
    const updatesFollowers = usersFollowers.map(user => this.model('User').updateOne({ _id: user._id }, { $pull: { followers: this._id } }));
  
    // Execute todas as atualizações
    await Promise.all([...updatesFollowing, ...updatesFollowers]);
    
    next();
  });
  
  