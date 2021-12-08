const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const Session = new Schema({
    refreshToken: {
        type: String,
        default: '',
    }
});

const UserSchema = new Schema({
    username: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        default: "",
    },
    refreshToken: {
        type: [Session],
    },
});

UserSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret.refreshToken
        return ret
    },
});

UserSchema.statics.login = async function(email, password){
    const user = await this.findOne({ email });
    if(!user) throw new Error('No Such User Exists');

    const isMatch = await bcrypt.compare(password, user.password);
   
    if(isMatch){
        return user;
    }
    throw new Error("Incorrect Password");
}


module.exports = mongoose.model('User', UserSchema)
