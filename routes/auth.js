const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getJWTToken,
        getRefreshToken,
        COOKIE_OPTIONS,
        requireAuth  } = require('../middlewares/authMiddlewares'); 


router.post('/signup', async (req, res) => {
   const {username, email, password } = req.body;
   try {
       let user = await User.findOne({ email });
      
       if(user){
        return res.status(400).json({ msg: "User with this email already exists" });
       }
       const hashedPassword = await bcrypt.hash(password, 10);

       user = await User.create({ username, email, password: hashedPassword });

       const [jwtToken, refreshToken] = [getJWTToken({ id: user._id}), getRefreshToken({ id: user._id})];
      
       await User.updateOne(
           { "_id" : user._id }, 
            { $push: { "refreshToken": { refreshToken }}
        }); 

       res.cookie('p_chat_refresh', refreshToken, COOKIE_OPTIONS);
       res.status(201).json({ token: jwtToken, email: user.email });
   } catch (error) {
       res.status(500).json({error});
   }
});


router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.login(email, password);
        const [jwtToken, refreshToken] = [getJWTToken({ id: user._id}), getRefreshToken({ id: user._id})];
      
        await User.updateOne(
            { "_id" : user._id }, 
             { $push: { "refreshToken": { refreshToken }}
         }); 
 
        res.cookie('p_chat_refresh', refreshToken, COOKIE_OPTIONS);
        res.status(201).json({ token: jwtToken, email: user.email });
    } catch (error) {
        if(error.message){
            error = error.message;
        }
        console.log({error});
        res.status(401).json({error});
    }
});

router.post('/logout', requireAuth , async (req, res) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    try {
        const user = await User.findById(req.user?.id);
        if(!user) return res.status(401).json({message: "No User Found"});

        const tokenIndex = user.refreshToken.findIndex(token => token.refreshToken === refreshToken);
        console.log(refreshToken);
        if(tokenIndex !== -1){

            await User.updateOne(
               { _id: user._id},
               { $pull: { refreshToken: { refreshToken: refreshToken}}}
           );
    
           res.cookie("p_chat_refresh", '',{ ...COOKIE_OPTIONS, maxAge: 1});
           res.json({ success: true , id : user._id})
        }else{
            console.log('error')
            return res.status(401).json({message: "Invalid Token"});
        }
    } catch (error) {
        res.status(500).json({ error })
    }
});


router.post('/refresh', async (req, res) => {
    const { signedCookies = {} } = req;
    const { p_chat_refresh } = signedCookies;

    if(!p_chat_refresh){
       return res.status(401).json({message: "No Token Provided"});
    }

    try {
        const { id : userId } = jwt.verify(p_chat_refresh, process.env.REFRESH_SECRET);
        const user = await User.findById(userId);
        if(!user) return res.status(401).json({message: "No User Found"});

        const tokenIndex = user.refreshToken.findIndex(token => token.refreshToken === p_chat_refresh);

        if(tokenIndex === -1){
           return res.status(401).json({message: "Invalid Token"});
        }
        // creating new Tokens
        const [jwtToken, newRefreshToken] = [getJWTToken({ id: userId }), getRefreshToken({ id: userId })];
        // Replacing the refreshToken in Database 
        user.refreshToken[tokenIndex] = { "refreshToken": newRefreshToken}
        
        await user.save(); // Saving the user with updated refreshToken

        res.cookie('p_chat_refresh', newRefreshToken, COOKIE_OPTIONS);
        res.json({token: jwtToken, email: user.email });
    } catch (error) {
        console.log({error});
        res.status(500).json({error});
    } 

});


module.exports = router;