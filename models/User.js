const mongoose=require('mongoose')
const crypto=require('crypto')

//User Scehma

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true
        },
        hashed_password: {
            type: String,
            required: true
        },


        avatar:{
            type:String
        
        },
        
        date:{
        type:Date,
        default:Date.now
        },
        
        salt: String,
        role: {
            type: String,
            default: 'subscriber'
        },


        resetPasswordLink: {
            data: String,
            default: ''
        },    
    },
    { timestamps: true }
);

//Virtual Password

UserSchema
.virtual('password')
.set(function(password){
    this._password=password
    this.salt=this.makeSalt()
    this.hashed_password=this.encryptPassword(password)
})
.get(function(){
return this._password
})

//methods 
UserSchema.methods = {
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password; // true false
    },

    encryptPassword: function(password) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },

    makeSalt: function() {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    }
};

module.exports =User= mongoose.model('user', UserSchema);

