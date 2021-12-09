const router = require('express').Router();
const { requireAuth } = require('../middlewares/authMiddlewares');
const User = require('../models/user');
const Channel = require('../models/channel');

router.post('/', requireAuth, async (req, res) => {
    const {id1, id2} = req.body;
    try {
        let channel = await Channel.findOne({
            $and: [{participants: { $in: [id1] }, participants: { $in: [id2] }}]  
          });
    
        if(channel){
            return res.status(401).json({ error: 'User Already Added'});
        }   
        channel = await Channel.create({ participants: [id1, id2] });
        res.status(201).json({ channel });
    } catch (error) {
        res.status(500).json({error});
    }
});


router.get('/:userId', requireAuth, async (req, res) => {
    const id = req.params.userId;
    try {
        let channels =  await Channel.find({
            participant: { $in: [id] }
        })
        res.json({ channels});
    } catch (error) {
        res.status(500).json({error});
    }
})


module.exports = router;