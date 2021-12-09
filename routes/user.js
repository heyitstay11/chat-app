const router = require('express').Router();
const { requireAuth } = require('../middlewares/authMiddlewares');
const User = require('../models/user');


router.get('/:email', requireAuth, async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ email }, { password: 0, __v: 0 });
        if(!user){
           return res.status(400).json({'error': "No user with this email"});
        }
        res.json({user});
    } catch (error) {
        res.status(500).json({error});
    }
});


module.exports = router;