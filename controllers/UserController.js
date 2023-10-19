const User = require('../models/User')


const nodemailer = require('nodemailer')
const randomstring = require('randomstring')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')

const jwtSecret = process.env.JWT_SECRET

// Generate user token
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: "7d",
    })
}
const register = async(req,res) =>{
    
  const {name,email,password} = req.body //pegando nome, email e senha que chegam do corpo da requisição

  // check if user exists
  const user = await User.findOne({email})
  

  //check if username exists
  const userName = await User.findOne({name})

  console.log(userName)
  if(userName){
    res.status(422).json({errors: ['O nome já cadastrado, por favor coloque outro nome.']})
    return
  }
  

  if(user) {
      res.status(422).json({errors: ['E-mail já cadastrado'] })
      return 
  }

  res.status(200).json({message: ['Usuario ativado']})
  
  // Generate password hash
  const salt = await bcrypt.genSalt()
  const passwordHash = await bcrypt.hash(password, salt)

  // Create user
  const newUser = await User.create({
      name,
      email,
      password: passwordHash
  })

  // if user was created successfully, return the token
  if(!newUser){
      res.status(422).json({errors:['Houve um erro, por favor tente mais tarde']})
      return
  }


 // Send activation email
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL,
      auth: {
        user:  process.env.USER,
        pass:  process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: 'reactgram@outlook.com',
      to: email,
      subject: 'Ativação de conta',
      html: `
        <p>Obrigado por se registrar! Por favor, clique no link abaixo para ativar sua conta:</p>
        <p><a href="https://reactgrambackend.onrender.com/api/users/activate/${newUser._id}">Ativar conta</a></p>
      `,
    };
    
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'E-mail de ativação enviado.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: ['Ocorreu um erro ao enviar o e-mail.'] });
  }
}


// Sign user in
const login = async (req,res) => {

    const {email,password} = req.body

    const user = await User.findOne({email})

    // Check if user exists 
    if(!user){
        res.status(404).json({errors: ['Usuário não encontrado.']})
        return
    }

    // Check if password matches
    if(!(await bcrypt.compare(password, user.password))){
        res.status(422).json({errors: ['Senha inválida.']})
        return
    }
    
    if(!user.isActive){
      res.status(403).json({errorCode: 403, errors: ['A conta não está ativada']})
      return
  }

    // Return user with token
    res.status(201).json({
        _id: user._id,
        name: user.name,
        profileImage: user.profileImage,
        token: generateToken(user._id),
        followers: user.followers,
        following: user.following
    })


}

// Get current logged in user
    const getCurrentUser = async (req,res) => {

        const user = req.user
        
        res.status(200).json(user)

    }


// Update a user
    const update = async(req,res) => {

        
        const { name,email,password, oldPassword, bio} = req.body

        let profileImage = null

        if(req.file){
            profileImage = req.file.filename
        }


        const reqUser = req.user

        const user = await User.findById( new mongoose.Types.ObjectId(reqUser._id))

        if(name){
            user.name = name
        }
        
        if(email){
            user.email = email
        }
        try {
            if (password && oldPassword) {
                const isValidPassword = await bcrypt.compare(oldPassword, user.password)
                if (!isValidPassword) {
                  return res.status(422).json({ errors: ["Senha antiga incorreta."] });
                }
                const salt = await bcrypt.genSalt()
                const passwordHash = await bcrypt.hash(password, salt)
                user.password = passwordHash
              }
              else if (password && !oldPassword) {
                return res.status(422).json({ errors: ["A senha antiga é obrigatória para atualizar a senha."] });
              }
            
        } catch (error) {
            console.log(error)
        
        }

        if (profileImage) {
            user.profileImage = profileImage;
        }
        

        if(bio){
            user.bio = bio
        }

        await user.save()

        res.status(200).json(user)


    }

// Get user by Id
const getUserById = async(req,res) =>{

    const {id} = req.params

  
   try {
    const user = await User.findById(new mongoose.Types.ObjectId(id)).select('-password')


      // Check if user exists
      if(!user){
        res.status(404).json({ errors: ['Usuário não encontrado']})
        return
    }
    
    res.status(200).json(user)
   } catch(error){
    res.status(404).json({ errors: ['Usuário não encontrado']})
    return
   }
}
// Forgot Password 
const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não encontrado.'] });
      }
  
      const newPassword = randomstring.generate({
        length: 8,
        charset: 'alphanumeric',
      });
  
      // Atualiza a senha do usuário no banco de dados
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL,
        auth: {
          user:  process.env.USER,
          pass:  process.env.PASSWORD,
        },
      });
  
      const mailOptions = {
        from: 'reactgram@outlook.com',
        to: email,
        subject: 'Recuperação de senha',
        html: `
          <p>Você solicitou a recuperação de senha. Sua nova senha é:</p>
          <p><strong>${newPassword}</strong></p>
          <p>Por favor, faça login com essa nova senha e altere-a o quanto antes.</p>
        `,
      };
      
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'E-mail de recuperação enviado.' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ errors: ['Ocorreu um erro ao enviar o e-mail.'] });
    }
  };

 // FOLLOW A USER
const followUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user;

  // Check if user to follow exists
  const userToFollow = await User.findById(userId);
  console.log(userToFollow)
  if (!userToFollow) {
    res.status(404).json({ errors: ["Usuário não encontrado."] });
    return;
  }
  // Check if user is trying to follow himself
  if (userId === currentUser._id.toString()) {
    res.status(422).json({ errors: ["Você não pode se seguir."] });
    return;
  }


  // Check if user is already following the user to follow
  const isFollowing = currentUser.following.some(user => user.toString() === userId);
  if (isFollowing) {
    res.status(422).json({ errors: ["Você já está seguindo esse usuário."] });
    return;
  }

  // Follow user
  currentUser.following.push(userToFollow._id);
  await currentUser.save();

  userToFollow.followers.push(currentUser._id);
  await userToFollow.save();

  res.status(200).json({
    message: "Usuário seguido com sucesso.",
    user: userToFollow,
    userAtual: currentUser
  });
};

  


const unFollowUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user;

  // Check if user is trying to unfollow himself
  if (userId === currentUser._id.toString()) {
    res.status(422).json({ errors: ["Você não pode deixar de seguir a si mesmo."] });
    return;
  }

  // Check if user to unfollow exists
  const userToUnfollow = await User.findById(userId);
  if (!userToUnfollow) {
    res.status(404).json({ errors: ["Usuário não encontrado."] });
    return;
  }

  // Check if user is already not following the user to unfollow
  const isFollowing = currentUser.following.some(user => user.toString() === userId);
  if (!isFollowing) {
    res.status(422).json({ errors: ["Você não está seguindo esse usuário."] });
    return;
  }

  // Unfollow user
  currentUser.following = currentUser.following.filter(user => user.toString() !== userId);
  await currentUser.save();

  userToUnfollow.followers = userToUnfollow.followers.filter(user => user.toString() !== currentUser._id.toString());
  await userToUnfollow.save();

  res.status(200).json({
    message: "Usuário deixou de ser seguido com sucesso.",
    user: userToUnfollow,
    userAtual: currentUser
  });
};


    
// GET /users/:userId/following
const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString()

    // Busca o usuário pelo ID e popula 'following'
    const user = await User.findById(userId).populate('following');
    const currentUser = await User.findById(currentUserId).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    console.log(user)
    const following = user.following.map(followedUser => {
      return {
        userId: followedUser._id.toString(),
        userName: followedUser.name,
        profileImage: followedUser.profileImage,
        email: followedUser.email
        // Adicione aqui quaisquer outros campos que você queira retornar
      };
    });

    return res.status(200).json( {following,currentUser} );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar os seguidores do usuário.' });
  }
};


const getUserFollowers = async(req,res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id.toString()
  
  try {
    // Busca o usuário pelo ID e popula 'followers'
    const user = await User.findById(userId).populate('followers');
    const currentUser = await User.findById(currentUserId).select('-password')

    if (!user) {
      return res.status(404).json({ errors: ['Usuário não encontrado'] });
    }

    const followersData = user.followers.map(follower => {
      return {
        userId: follower._id,
        userName: follower.name,
        profileImage: follower.profileImage,
        email: follower.email
      };
    });

    res.status(200).json({followersData,currentUser});
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Erro ao buscar seguidores'] });
  }
}

 // Searc photos by title
 const searchUsers = async(req,res) => {

  const {q} = req.query 

  try {
    
    const user = await User.find({ name: new RegExp(q, "i" )}).exec()  

    res.status(200).json(user)
  } catch (error) {
    console.log(error)
  }
}
const sendVerificattionEmail = async(req,res) => {

    const {email} = req.body
    console.log(email)

    try {

    if(!email){
      return res.status(404).json({errors: ['Informe o e-mail']})
    }
    // Procura o usuário pelo email
    // nda
    const user = await User.findOne({email});

    if (!user) {
        return res.status(404).json({ errors: ['Usuário não encontrado.'] });
    }

    // Envia o e-mail
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL,
      auth: {
        user:  process.env.USER,  
        pass:  process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: 'reactgram@outlook.com',
      to: email,
      subject: 'Ativação de conta',
      html: `
        <p>Obrigado por se registrar! Por favor, clique no link abaixo para ativar sua conta:</p>
        <p><a href="https://reactgrambackend.onrender.com/api/users/activate/${user._id}">Ativar conta</a></p>
      `,  
    };
    
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'E-mail de ativação enviado.' });

} catch (error) {
    console.log(error);
    res.status(500).json({ errors: ['Ocorreu um erro ao ativar o usuário.'] });
}
}

// Ativar usuário
const activateUser = async(req, res) => {
  const { userId } = req.params; // pegando o userId que chega do corpo da requisição
    console.log(userId)
  try {
      // Procura o usuário pelo ID
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ errors: ['Usuário não encontrado.'] });
      }

      // Ativa o usuário
      user.isActive = true;
      await user.save();

      // Redireciona o usuário para a página de login do seu aplicativo
      res.redirect('https://reactgram.com.br');
  } catch (error) {
      console.log(error);
      res.status(500).json({ errors: ['Ocorreu um erro ao ativar o usuário.'] });
  }
};





module.exports = {
    register,
    login,
    getCurrentUser,
    update,
    getUserById,
    forgotPassword,
    followUser,
    unFollowUser,
    getUserFollowing,
    getUserFollowers,
    searchUsers,
    activateUser,
    sendVerificattionEmail
}