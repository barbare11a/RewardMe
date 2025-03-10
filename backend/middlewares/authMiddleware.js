const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    //Verify token from request headers
    try {
        token = req.headers.authorization.split(' ')[1];
    }

    catch(error) {
        res.status(401).json({msg: "Authorization denied"});
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ msg: "Token is not valid"});
            }
            // Attach decoded token data to request object
            req.user = decoded;
            next()
        });
    }
    catch (error) {
        res.status(401).json({ msg: "Authorization denied" });
    }
}

module.exports = authMiddleware;

//for jwt.verify:
// If a callback is supplied, function acts asynchronously. 
// The callback is called with the decoded payload if the signature is valid and optional expiration, audience, or issuer are valid. 
// If not, it will be called with the error err.

