const express = require('express');
const connectDB =require('./config/db')
const cors = require('cors')
const  bodyParser = require('body-parser')


const app = express();
app.use(express.json({extentded:false}))
require('dotenv').config({
    path: './config/config.env'
})


//Connect db
connectDB();

//init middleware
app.use(express.json({extentded:false}))

app.use(cors());

app.use('/public', express.static('public'));



//Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))
app.use((req, res) => {
    res.status(404).json({
        success: false,
        msg: "Page not founded"
    })
})

app.get('/', (req,res)=>res.send('API Running'));

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=> console.log(`Server Started on port ${PORT}`));
