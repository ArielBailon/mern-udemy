const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

// @ruta     POST api/users
// @descri   Registrar un usuario
// @acceso   Público
router.post('/', [
	check('name', 'Name is required').not().isEmpty(),
	check('email', 'Please include a valid email').isEmail(),
	check('password', 'Please enter a password with 6 or more characters').isLength({ min:6 })
], async (req, res) => {
	const errores = validationResult(req);
	if(!errores.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	const { name, email, password } = req.body;

	// Revisar si el usuario existe
	try {
		let user = await User.findOne({ email });

		if(user) {
			return res.status(400).json({ errors: [ { msg: 'User already exists'} ] });
		}

	// Llamar a los gravatars de los usuarios
	const avatar = gravatar.url(email, {
		s: '200',
		r: 'pg',
		d: 'mm'
	})

	user = new User({
		name, email, avatar, password
	});

	// Encryptar el password
	const salt = await bcrypt.genSalt(10);

	user.password = await bcrypt.hash(password, salt);

	await user.save();

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
