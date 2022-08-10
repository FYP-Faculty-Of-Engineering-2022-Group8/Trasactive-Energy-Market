const express=require('express')
const router=express.Router()
const auth=require('../../middleware/auth')
const Profile=require('../../models/Profile')
const User=require('../../models/User')
const Photo=require('../../models/Pictures')
const { validationResult } = require('express-validator');
const { errorHandler } = require('../../helpers/dbErrorHandling');
const normalize = import('normalize-url')
var { v4 : uuidv4 } =require('uuid')
var multer  = require('multer'); 


const {
   profileChange,
   experienceadd,
   educationadd,
   coverphotoChange

  } = require('../../helpers/valid')


//@router GET api/profile/me
//@desc     Get current user profile
//@access  Private
router.get('/me',auth,async(req,res)=>{

try {
    
    const profile=await Profile.findOne({user:req.user.id}).populate('user',
    [
    'name',
    'avatar'
    ])

    if(!profile){
       return res.status(400).json({msg:'Profile is not yet initialized'})
    }
 res.json(profile)
} catch (err) {
    console.log('Save error', errorHandler(err));
    return res.status(401).json({
      errors: errorHandler(err)
    });
    
}

})





//@router POST api/profile
//@desc     Ceate or update profule
//@access  Private


router.post('/',auth,profileChange,async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
    }
  
const{
   website,
    university,
    location,
    bio,
    status,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
}=req.body




//Build profile
const profileFields={ user: req.user.id,
 university,
  location,
  website: website && website !== '' ? normalize(website, { forceHttps: true }) : '',
  bio,
  skills: Array.isArray(skills)
    ? skills
    : skills.split(',').map((skill) => ' ' + skill.trim()),
  status,}


//Build social array
profileFields.social={}
if(youtube) profileFields.social.youtube=youtube
if(facebook) profileFields.social.facebook=facebook
if(twitter) profileFields.social.twitter=twitter
if(linkedin) profileFields.social.linkedin=linkedin
if(instagram) profileFields.social.instagram=instagram


try {

   let profile=await Profile.findOne({user:req.user.id})
   if(profile){
       //Update
       profile=await Profile.findOneAndUpdate(
           {user:req.user.id},
           {$set:profileFields},
           {new:true},
           
           )
        return res.json(profile)   
   } 


   //CREATE
profile=  new Profile(profileFields)
await profile.save()
res.json(profile)

} catch (err) {
    console.log('Save error', errorHandler(err));
    return res.status(401).json({
      errors: errorHandler(err)
    });
    
}

})





//@router GET api/profile
//@desc     GET all profiles
//@access  Public

router.get('/',async(req,res)=>{
    try {
     const profiles=await Profile.find().populate('user',
     [
      'name',
      'avatar'   
     ])
res.json(profiles)
    } catch (err) {
        console.log('Save error', errorHandler(err));
                    return res.status(401).json({
                      errors: errorHandler(err)
                    });
    }
})



//@router GET api/profile/user/:user_id
//@desc     GET  profile by user id
//@access  Public

router.get('/user/:user_id',async(req,res)=>{
    try {
     const profile=await Profile.findOne({user:req.params.user_id}).populate('user',
     [
      'name',
      'avatar'   
     ])

if(!profile)   return res.status(400).json({msg:'Profile not found'});

res.json(profile)
    } catch (err) {
        console.error(err.message)
        if(err.kind =='ObjectId'){
            return res.status(400).json({msg:'Profile not found'});
        }
        res.status(500).send('Server Error');
    }
})





//@router DELETE api/profile
//@desc     DELETE all profile,user & posts
//@access  Private

router.delete('/',auth,async(req,res)=>{
    try {

//Remove Photo
await Photo.findOneAndRemove({user:req.user.id})
//Remove profile
 await Profile.findOneAndRemove({user:req.user.id})

 //Remove user
 await User.findOneAndRemove({_id:req.user.id})

 res.json({msg:'User Deleted'})
    } catch (err) {
        console.log('Save error', errorHandler(err));
        return res.status(401).json({
          errors: errorHandler(err)
        });
    }
})



//@router PUT api/profile/experience
//@desc     Add profile expereince
//@access  Private



router.put('/experience',auth,experienceadd,async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array().map(error => error.msg)[0];
      return res.status(422).json({
        errors: firstError
      });
    }


      const{
          title,
          company,
          location,
          from,
          to,
          current,
          description

      }=req.body

    const newExp={
       title,
       company,
       location,
       from,
       to,
       current,
       description 
    }  

    try {
        
const profile=await Profile.findOne({user:req.user.id})

profile.experience.unshift(newExp)

await profile.save()
res.json(profile)

    } catch (err) {
        console.log('Save error', errorHandler(err));
                    return res.status(401).json({
                      errors: errorHandler(err)
                    }); 
    }
})



//@router DELETE api/profile/education/:exp_id
//@desc     DELETE education from profile
//@access  Private

router.delete('/experience/:exp_id',auth,async(req,res)=>{
try {

    const profile=await Profile.findOne({user:req.user.id})
    //Get remove index

    const removeIndex=profile.experience.map(item=>item.id).indexOf(req.params.exp_id)

    profile.experience.splice(removeIndex,1);

    await profile.save()
    res.json(profile)

} catch (err) {
    console.log('Save error', errorHandler(err));
                    return res.status(401).json({
                      errors: errorHandler(err)
                    });
}

})




//@router PUT api/profile/education
//@desc     Add profile education
//@access  Private



router.put('/education',auth,educationadd,async(req,res)=>{
 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array().map(error => error.msg)[0];
      return res.status(422).json({
        errors: firstError
      });
    }


      const{
          school,
          degree,
          fieldofstudy,
          from,
          to,
          current,
          description

      }=req.body

    const newEdu={
       school,
       degree,
       fieldofstudy,
       from,
       to,
       current,
       description 
    }  

    try {
        
const profile=await Profile.findOne({user:req.user.id})

profile.education.unshift(newEdu)

await profile.save()
res.json(profile)

    } catch (err) {
        console.log('Save error', errorHandler(err));
        return res.status(401).json({
          errors: errorHandler(err)
        });
    }
})



//@router DELETE api/profile/education/:edu_id
//@desc     DELETE education from profile
//@access  Private

router.delete('/education/:edu_id',auth,async(req,res)=>{
try {

    const profile=await Profile.findOne({user:req.user.id})
    //Get remove index

    const removeIndex=profile.education.map(item=>item.id).indexOf(req.params.edu_id)

    profile.education.splice(removeIndex,1);

    await profile.save()
    res.json(profile)

} catch (err) {
    console.log('Save error', errorHandler(err));
                    return res.status(401).json({
                      errors: errorHandler(err)
                    });
}

})







//@router GET api/profile/photo/me
//@desc     Get current user PHOTO
//@access  Private
router.get('/photo/me',auth,async(req,res)=>{

  try {
      
      const photo=await Photo.findOne({user:req.user.id}).populate('user',
      [
      'name'
      ])
  
      if(!photo){
         return res.status(400).json({msg:'Add a Profile Picture'})
      }
   res.json(photo)
  } catch (err) {
      console.log('Save error', errorHandler(err));
      return res.status(401).json({
        errors: errorHandler(err)
      });
      
  }
  
  })


const DIR = './public/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});




router.post('/upload',upload.single('file'),auth,async(req, res, next)=> {
   const url = req.protocol + '://' + req.get('host')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
    }

try {
      const userFields={ user: req.user.id,
         avatar:url + '/public/' + req.file.filename,
     }
 
 
 
   let user=await Photo.findOne({user:req.user.id})
   if(user){
       //Update
      user=await Photo.findOneAndUpdate(
           {user:req.user.id},
           {$set:userFields},
           {new:true},
           
           )
        return res.json(user)   
   } 
 
 
   //CREATE
 user=  new Photo(userFields)
 await user.save()
 res.json(user)
 

} catch (err) {
    console.log('Save error', errorHandler(err));
                return res.status(401).json({
                  errors: errorHandler(err)
                }); 
}

})


module.exports=router