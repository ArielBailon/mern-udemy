const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

// @ruta	GET api/auth
// @desc	Test route
// @access	Public

router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch(err){
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @ruta     POST api/auth
// @descri   Autenticar usuario y obtener el token
// @acceso   Público
router.post('/', [
	check('email', 'Please include a valid email').isEmail(),
	check('password', 'Password is required').exists()
], async (req, res) => {
	const errores = validationResult(req);
	if(!errores.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	const { email, password } = req.body;

	// Revisar si el usuario existe
	try {
		let user = await User.findOne({ email });

		if(!user) {
			return res.status(400).json({ errors: [ { msg: 'Invalid credentials'} ] });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ errors: [ { msg: 'Invalid credentials'} ] });
		}

	// Retornar jsonwebtoken
	const payload = {
		user: {
			id: user.id
		}
	}

	jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 36000 },
	(err, token) => {
		if (err) throw err;
		res.json({ token });
	});


	} catch(err){
		console.error(err.message);
		res.status(500).send('Server error')
	}

})

module.exports = router;
