import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    try {
        // get the token from the header if exists => bearer {token}
        const token = req.headers.authorization?.split(" ")[1]

        // verify token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json({message: "Token Expired or Ivalid Authentication"})

                req.user = user
                next()
        })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}