const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20,
    },
    
    email:{
        type: String,
        maxLength: 50,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

UserSchema.virtual("fullname").get(function (){
    return `${this.firstname} ${this.lastname}`;
});

module.exports = mongoose.model("User", UserSchema);