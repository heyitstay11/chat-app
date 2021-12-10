const router = require('express').Router();
const { requireAuth } = require('../middlewares/authMiddlewares');
const Channel = require('../models/channel');

// get Channel data
router.get('/:id', requireAuth, async (req, res) => {
    try {
        let channel = await Channel.findById(req.params.id);
        if(!channel){
            return res.status(401).json({ error: 'This channel does not exists'});
        }
        res.json(channel);
    } catch (error) {
        res.status(500).json({error});
    }
});


// create a channel
router.post('/', requireAuth, async (req, res) => {
   const { id: id1, name: name1 } = req.body.user1;
   const { id: id2, name: name2 } = req.body.user2;
  
    try {
        let channel = await Channel.findOne({
            $and: [{participants: { $in: [id1] }, participants: { $in: [id2] }}]  
          });
    
        if(channel){
            return res.status(401).json({ error: 'User Already Added'});
        }   
        channel = await Channel.create({ participants: [id1, id2] , title: name1+name2 });
        res.status(201).json({ channel });
    } catch (error) {
        res.status(500).json({error});
    }
});


// Get All Channels
router.get('/user/:userId', requireAuth, async (req, res) => {
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