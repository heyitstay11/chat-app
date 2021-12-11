const router = require('express').Router();
const Message = require('../models/message');
const { requireAuth } = require('../middlewares/authMiddlewares');
const sanitizeHtml = require('sanitize-html');
const { emojify } = require('node-emoji');
const clean = (dirty) => sanitizeHtml(dirty, {
    allowedTags: [ 'b', 'i', 'em' , 'strong', 'a'],
    allowedAttributes: {
        'a': [ 'href' ]
    },
});

router.post('/', requireAuth, async (req, res) => {
    const {channelId, sender, text, msg_id} = req.body;
    try {
        let message = await Message.create({
            channel_id: channelId, 
            sender,
            msg_id,
            sender_id: req.user.id,
            text: emojify(clean(text)) 
        });
        res.json({message});
    } catch (error) {
        res.status(500).json({error});
    }
})

router.get('/:channelId', requireAuth, async (req, res) => {
    try {
        let messages = await Message.find({channel_id: req.params.channelId });
        res.json({messages});
    } catch (error) {
        res.status(500).json({error});
    }
});


module.exports = router;