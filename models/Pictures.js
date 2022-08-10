const mongoose=require('mongoose')
const crypto=require('crypto')
const Schema = mongoose.Schema;
//User Scehma

const PhotoSchema = new Schema(
    {
        user: {
           type:Schema.Types.ObjectId,
            ref: "user"
          },

        avatar: {
            type: String
        }
    },
    { timestamps: true }
);


module.exports =Photo= mongoose.model('Photo', PhotoSchema);

