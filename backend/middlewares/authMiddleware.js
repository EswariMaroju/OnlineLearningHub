const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
      console.log('Auth middleware - No authorization header found');
      return res
        .status(401)
        .send({ message: "Authorization header missing", success: false });
    }

    const token = req.headers["authorization"].split(" ")[1];
    console.log('Auth middleware - Token extracted:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('Auth middleware - No token found in authorization header');
      return res
        .status(401)
        .send({ message: "Token missing from authorization header", success: false });
    }

    // Check if JWT_KEY is set
    if (!process.env.JWT_KEY) {
      console.error('Auth middleware - JWT_KEY environment variable is not set');
      return res
        .status(500)
        .send({ message: "Server configuration error", success: false });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decode) => {
      if (err) {
        console.log('Auth middleware - Token verification failed:', err.message);
        return res
          .status(401)
          .send({ message: "Token is not valid", success: false });
      } else {
        console.log('Auth middleware - Token verified successfully, user ID:', decode.id);
        req.user = { id: decode.id };
        next();
      }
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).send({ message: "Internal server error", success: false });
  }
};
