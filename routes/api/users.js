

const express=require('express')
const router=express.Router()
const { validationResult } = require('express-validator');
const { errorHandler } = require('../../helpers/dbErrorHandling');
const User=require('../../models/User')
const gravatar=require('gravatar')
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const auth =require('../../middleware/auth')
const _ = require('lodash');
const pino = require('express-pino-logger')();
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);






//Nodemailer initialization
const transporter = nodemailer.createTransport({
    service: "gmail", //your service provider, I have used gmail here but it's not much recommended.
     port: 587,
     secure: false, 
     auth: {
       user: process.env.EMAIL_FROM, // Email you use to send emails
       pass:process.env.EMAIL_PASS, // Password of the relavent email
     },
  tls:{
     rejectUnauthorized:false
  }
  
   });
  

const {
    validSign,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../../helpers/valid')



//@router Post api/users
//@desc   Test route
//@access  Public
router.post('/register',validSign,async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
          errors: firstError
        });
      }

const{name,email,password}=req.body

try {
//see if user exist
let user=await User.findOne({email})
        if (user) {
          return res.status(400).json({
            errors: 'Email is taken'
          });
        }
    
/*Get users gravatar
const avatar=gravatar.url(email,{
    s:'200',
    r:'pg',
    d:'mm'
})*/

user=new User({
    name,
    email,
   // avatar,
    password
})
//setting jsonwebtoken
const payload={
    user:{
        id:user.id
    }
}

const token = jwt.sign(
    {
     payload,
      name,
      email,
      password,
     // avatar
    },
    process.env.JWT_ACCOUNT_ACTIVATION,
    {
      expiresIn: '100m'
    }
  );
//send the email confiramtion link
let mailOption ={
    from:  '"HK MEDIA" <nalinmannage@gmail.com>',
    to:email,
    subject: 'Account activation link',
    html: `
            <h1>Please use the following to activate your account</h1>
              <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
              <hr />
              <p>This email may contain sensitive information</p>
              <p>${process.env.CLIENT_URL}</p>
          `
  };



  transporter.sendMail(mailOption).then(sent=>{
    return res.json({
      message:`Email has been sent to ${email}`
    })
  })

  
} catch (err) {
    return res.status(400).json({
        error:errorHandler(err)
      })
}
})



router.put('/forgotpassword', forgotPasswordValidator,(req,res)=>{

  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    User.findOne(
      {
        email
      },
      (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            errors: 'User with that email does not exist'
          });
        }

        const token = jwt.sign(
          {
            _id: user._id
          },
          process.env.JWT_RESET_PASSWORD,
          {
            expiresIn: '10m'
          }
        );

        const mailOption ={
          from:  '"HK MEDIA " <nalinmannage@gmail.com>',
          to:email,
          subject: 'Password Reset link',
          html: `
                  <h1>Please click the link to reset your password</h1>
                    <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                    <hr />
                    <p>This email may contain sensitive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `
        };

        return user.updateOne(
          {
            resetPasswordLink: token
          },
          (err, success) => {
            if (err) {
              console.log('RESET PASSWORD LINK ERROR', err);
              return res.status(400).json({
                error:
                  'Database connection error on user password forgot request'
              });
            } else {
              transporter.sendMail(mailOption).then(sent=>{
                return res.json({
                  message:`Email has been sent to ${email}`
                })
              }).catch(err=>{
                return res.status(400).json({
                  error:errorHandler(err)
                })
              })
            }
          }
        );
      }
    );
  }
});



router.put('/resetpassword',resetPasswordValidator, async(req,res)=>{
  const { resetPasswordLink, newPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    if (resetPasswordLink) {
      jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(
        err,
        decoded
      ) {
        if (err) {
          return res.status(400).json({
            error: 'Expired link. Try again'
          });
        }

        User.findOne(
          {
            resetPasswordLink
          },
          
          (err, user) => {
            if (err || !user) {
              return res.status(400).json({
                error: 'Something went wrong. Try later'
              });
            }

            const updatedFields = {
              password: newPassword,
              resetPasswordLink: ''
            };

            user = _.extend(user, updatedFields);

            user.save((err, result) => {
              if (err) {
                return res.status(400).json({
                  error: 'Error resetting user password'
                });
              }
              res.json({
                message: `Great! Now you can login with your new password`
              });
            });
          }
        );
      });
    }
  }
})







router.post('/services',async(req,res)=>{

  client.messages
  .create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: req.body.to,
    body: req.body.body
  })
  .then(() => {
    res.send(JSON.stringify({ success: true }));
  })
  .catch(err => {
    console.log(err);
    res.send(JSON.stringify({ success: false }));
  });
})













module.exports=router

