const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;
    if (req?.cookies[`token_${req.body.wallid}`]) {
        token = req?.cookies[`token_${req.body.wallid}`];
    }

    if (!token) {
        return res.status(401).json({ msg: "Please login to access this route" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        if(decoded.id !== req.body.wallid){
            return res.status(401).json({ msg: "You are not authorized to access this route"})
        }
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
};

module.exports = protect;
