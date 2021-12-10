const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ChannelSchema = Schema({
    name: {
        type: String,
        default:''
    },
    participants : {
        type: Array,
        required: true
    },
    title: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model('Channel', ChannelSchema);
