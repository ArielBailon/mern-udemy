const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');


const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route	GET api/profile/me
// @desc	Get current users profile
// @access	Private

router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name','avatar']);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

	} catch(err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});


// @route	POST api/profile
// @desc	Create or update a user profile
// @access	Private

router.post('/', [ auth, [check('status', 'Status is required').not().isEmpty(),
													check('skills', 'Skills is required').not().isEmpty()] ] 
	, async (req, res)=>{ 
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({errors: errors.array() });
			}

			const {
				company, website, location, bio, status, githubusername, skills, youtube,
				facebook, twitter, instagram, linkedin
			} = req.body;

			//  Build profile object
			const profielFields = {};
			profielFields.user = req.user.id;
			if(company) profielFields.company = company;
			if(website) profielFields.website = website;
			if(location) profielFields.location = location;
			if(bio) profielFields.bio = bio;
			if(status) profielFields.status = status;
			if(githubusername) profielFields.githubusername = githubusername;
			if(skills) {
				profielFields.skills = skills.split(',').map(skill => skill.trim());
			}

			//  Build social object
			profielFields.social = {}
			if(youtube) profielFields.social.youtube = youtube;
			if(facebook) profielFields.social.facebook = facebook;
			if(twitter) profielFields.social.twitter = twitter;
			if(instagram) profielFields.social.instagram = instagram;
			if(linkedin) profielFields.social.linkedin = linkedin;

			try {
				let profile = await Profile.findOne({ user: req.user.id });

				if(profile) {
					// Update
					profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profielFields }, { new: true });
					return res.json(profile);
				};

				// Create
				profile = new Profile(profielFields);

				await profile.save();
				res.json(profile);


			} catch(err) {
				console.error(err.message);
				res.status(500).send('Server error');
			}

			res.send('test');

});

// @route	GET api/profile
// @desc	Get all profiles
// @access	Public

router.get('/', async (req, res) => {
	try{
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
})


module.exports = router;
