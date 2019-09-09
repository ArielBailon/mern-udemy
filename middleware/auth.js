const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next){
	// Obetner el token del header
	const token = req.header('x-auth-token');

	// Verificar si no hay token
	if(!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}

	// Verificar token
	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'));
		
		req.user = decoded.user;
		next();
	} catch(err){
		res.status(401).json({ msg: 'Token is not valid' });
	}
}
