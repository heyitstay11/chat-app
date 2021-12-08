const jwt = require('jsonwebtoken');
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30days
const JWT_TOKEN_EXPIRY = 15 * 60; // 15 minutes

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    signed: true,
    maxAge: +(REFRESH_TOKEN_EXPIRY) * 1000,
    sameSite: "none",
}

const getJWTToken = ( id ) => {
    const jwtToken =  jwt.sign(id, process.env.JWT_SECRET, {
        expiresIn: JWT_TOKEN_EXPIRY,
    });
    return jwtToken;
}

const getRefreshToken = ( id ) => {
    const refreshToken = jwt.sign(id, process.env.REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
    return refreshToken
}

const requireAuth = async (req, res, next) => {
    const token = req.headers["x-auth-token"];
    
    if(!token){
        return res.status(401).json({msg: "No Token Provided"});
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({msg: "Invalid Token", error});
    }
}


module.exports = {
    getJWTToken,
    getRefreshToken,
    COOKIE_OPTIONS,
    requireAuth,
}