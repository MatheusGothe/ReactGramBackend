const { getCurrentIp } = require('./currentIp/getCurrentIp')
require('dotenv').config()
const atualIp = getCurrentIp()
const express = require("express")
const path = require("path")
const cors = require("cors")
const deleteExpiredStories = require('./utils/deleteExpiredStories ');
const port = process.env.PORT

const app = express()

// config JSON and form data
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

  app.use(
    cors({
      origin: [
        `http://${atualIp}:3000`,
        "http://localhost:3000",
        "https://react-gram-six.vercel.app",
        "https://react-gram-xi.vercel.app",
        "https://react-gram-o9gf8i3is-matheusgothe-icloudcom.vercel.app",
      ],
      // methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
  console.log(atualIp)


// DB connection
require("./config/db.js")

// Upload directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")))

app.get('/server-ip', (req, res) => {
  const serverIp = req.socket.localAddress;
  res.json({ ip: serverIp });
});
// routes

const router = require('./routes/Router.js')

//deleteExpiredStories()

app.use(router)

app.listen(port, () => {
    console.log(`App rodando na porta ${port}`)
} )