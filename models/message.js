const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
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
        default: `socky-${nanoid(12)}`,
    }
})


module.exports = mongoose.model('Message', MessageSchema);
