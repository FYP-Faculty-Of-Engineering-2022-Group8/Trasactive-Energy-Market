const jwt =require('jsonwebtoken')

module.exports=function(req,res,next){
//Get token from the header
const token=req.header('x-auth-token')
//Check if not token

if(!token){
    return res.status(401).json({msg:'No token,Autohrization denied'})
}

try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    req.user=decoded.user
next()
}catch(err){
 res.status(401).json({msg:'Invalid Token'})
}


}