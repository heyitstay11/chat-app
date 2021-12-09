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
    titles: {
        type: Array,
        required: true
    }
});


module.exports = mongoose.model('Channel', ChannelSchema);
