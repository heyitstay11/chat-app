const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const MessageSchema = Schema({
    channel_id: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true,
    },
    sender_id: {
        type: String,
        required: true,
    },
    text: {
        type:String,
        required: true,
    },
    msg_id: {
        type: String,
        required: true,
    }
})


module.exports = mongoose.model('Message', MessageSchema);
