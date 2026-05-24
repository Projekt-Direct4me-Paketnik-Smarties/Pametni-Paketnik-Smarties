const UserModel = require('../models/User.js');
const bcrypt = require('bcrypt');

function sanitizeUser(user) {
	return {
		id: user._id,
		username: user.username,
		email: user.email
	};
}

module.exports = {
	register: async function (req, res) {
		try {
			const { username, email, password } = req.body;
			const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

			if (!username || !email || !password) {
				return res.status(400).json({
					message: 'username, email and password are required'
				});
			}

			const existing = await UserModel.findOne({
				$or: [{ username }, { email: normalizedEmail }]
			});

			if (existing) {
				return res.status(409).json({
					message: 'Username or email already exists'
				});
			}

			const user = new UserModel({ username, email: normalizedEmail, password });
			await user.save();

			return res.status(201).json({
				message: 'User registered successfully',
				user: sanitizeUser(user)
			});
		} catch (error) {
			console.error('Register error:', error);
			return res.status(500).json({
				message: 'Error when creating user'
			});
		}
	},

	login: async function (req, res) {
		try {
			const { username, email, password } = req.body;
			const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

			if ((!username && !normalizedEmail) || !password) {
				return res.status(400).json({
					message: 'username/email and password are required'
				});
			}

			const user = username
				? await UserModel.findOne({ username })
				: await UserModel.findOne({ email: normalizedEmail });

			if (!user) {
				return res.status(401).json({
					message: 'Invalid credentials'
				});
			}

			const isValid = await bcrypt.compare(password, user.password);

			if (!isValid) {
				return res.status(401).json({
					message: 'Invalid credentials'
				});
			}

			return res.status(200).json({
				message: 'Login successful',
				user: sanitizeUser(user)
			});
		} catch (error) {
			console.error('Login error:', error);
			return res.status(500).json({
				message: 'Error logging in'
			});
		}
	}
};
