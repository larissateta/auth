const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:{
        type: String,
        required: [true, "Email required"],
        unique: [true, "Email exists"]
    },
    password:{
        type: String,
        required: [true, "Password required"],
        unique: false
    }
})

module.exports = mongoose.model.Users || mongoose.model("Users", userSchema);