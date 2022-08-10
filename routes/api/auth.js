const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const gravatar=require('gravatar')
const { errorHandler } = require('../../helpers/dbErrorHandling');
const auth =require('../../middleware/auth');
const User = require('../../models/User');
const { validationResult } = require('express-validator');


const {
  validLogin,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../../helpers/valid')



//@router POST api/auth
//@desc   Test route
//@access  Public
router.post('/activation',(req,res)=>{
    const{ token}  = req.body;
if(!token){
    return res.status(401).json({msg:'No token,Autohrization denied'})
}

try{
    const decoded=jwt.verify(token,process.env.JWT_ACCOUNT_ACTIVATION)
    const { name, email,password} = decoded

    
   
    
    user=new User({
        name,
        email,
        password
        
       
    })
        
                user.save((err, user) => {
                  if (err) {
                    console.log('Save error', errorHandler(err));
                    return res.status(401).json({
                      errors: errorHandler(err)
                    });
                   
                  } else {
                    return res.json({
                      success: true,
                      user: user,
                      message: 'Signup success'
                     
                    });
                  }
                });

}catch(err){
    return res.json({
             message: 'error happening please try again'
           });
   }


})

module.exports=router


//@router post api/auth
//@desc   Test route
//@access  Public
router.post('/login',validLogin,async(req,res)=>{
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array().map(error => error.msg)[0];
      return res.status(422).json({
        errors: firstError
      });
    }

    const { email, password } = req.body;
    try {
        let user=await User.findOne({email})

if(!user){
    return res.status(400).json({
        errors:'Invalid Credentials'
      });
}

if (!user.authenticate(password)) {
  return res.status(400).json({
    errors: 'Invalid Credentials'
  });
  }
  const { _id, name,  role,date } = user;
  const payload={
    user:{
        id:user.id
    }
}

const token = jwt.sign(

     payload,
     

    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
  
  return res.json({
    token,
    user:{
        email,
        name,
        role,
        date,
        _id
    }

  })

    } catch (err) {
      console.log('Save error', errorHandler(err));
      return res.status(401).json({
        errors: errorHandler(err)
      });
     
        
    }
        
})
module.exports=router






//@router GET api/auth
//@desc   Test route
//@access  Private


router.get('/',auth,async(req,res)=>{
    
    try {
        let user=await User.findById(req.user.id).select('-hashed_password').select('-salt')
        if (user) {
         res.json(user);
        }
    } catch (err) {
      console.log('Save error', errorHandler(err));
      return res.status(401).json({
        errors: errorHandler(err)
      });
     
    }
})


module.exports=router


