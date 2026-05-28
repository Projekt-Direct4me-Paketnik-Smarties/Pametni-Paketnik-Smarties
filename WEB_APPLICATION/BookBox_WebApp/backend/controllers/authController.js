const UserModel = require('../models/User.js');
const RefreshTokenModel = require('../models/refreshTokenModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function sanitizeUser(user) {
	return {
		id: user._id,
		username: user.username,
		email: user.email
	};
}

function signAccessToken(user) {
	return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: process.env.JWT_EXP || '1h' });
}

function createRefreshToken() {
	return crypto.randomBytes(64).toString('hex');
}

function hashToken(token) {
	return crypto.createHash('sha256').update(token).digest('hex');
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

			// Issue access token
			const accessToken = signAccessToken(user);

			// Create and store refresh token (hashed)
			const refreshToken = createRefreshToken();
			const refreshHash = hashToken(refreshToken);
			const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_TTL_DAYS || '30') * 24 * 60 * 60 * 1000));

			await RefreshTokenModel.create({ user: user._id, tokenHash: refreshHash, expiresAt });

			return res.status(200).json({
				message: 'Login successful',
				accessToken,
				refreshToken,
				user: sanitizeUser(user)
			});
		} catch (error) {
			console.error('Login error:', error);
			return res.status(500).json({
				message: 'Error logging in'
			});
		}
	},

	refresh: async function (req, res) {
		try {
			const { refreshToken } = req.body;
			if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

			const refreshHash = hashToken(refreshToken);
			const record = await RefreshTokenModel.findOne({ tokenHash: refreshHash });
			if (!record || record.expiresAt < new Date()) return res.status(401).json({ message: 'Invalid refresh token' });

			const user = await UserModel.findById(record.user);
			if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

			const accessToken = signAccessToken(user);
			return res.status(200).json({ accessToken });
		} catch (error) {
			console.error('Refresh error:', error);
			return res.status(500).json({ message: 'Error refreshing token' });
		}
	},

	logout: async function (req, res) {
		try {
			const { refreshToken } = req.body;
			if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

			const refreshHash = hashToken(refreshToken);
			await RefreshTokenModel.deleteOne({ tokenHash: refreshHash });
			return res.status(200).json({ message: 'Logged out' });
		} catch (error) {
			console.error('Logout error:', error);
			return res.status(500).json({ message: 'Error logging out' });
		}
	}
};
