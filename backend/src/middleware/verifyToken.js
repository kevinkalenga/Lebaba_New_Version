const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        // get the token
        const token = req.cookies.token;
        // console.log(token)
        if (!token) {
            return res.status(401).send({ message: 'Invalide token' })
        }
        // verification in the doc of jwt
        const decoded = jwt.verify(token, JWT_SECRET)
        //failed
        if (!decoded) {
            return res.status(401).send({ message: 'Invalide token or not valid' })
        }
        // it's ok
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        console.error('Error while verifying token', error);
        res.status(401).send({ message: 'Error while verifying token' })
    }
}

module.exports = verifyToken;