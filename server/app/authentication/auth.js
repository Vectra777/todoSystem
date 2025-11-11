const db = require('../models');
const Employee = db.employees;

const {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
	revokeRefreshToken,
	hashPassword,
	comparePassword
} = require('./utils');

function sanitizeEmployee(employeeInstance) {
	if (!employeeInstance) return null;
	const plain = employeeInstance.toJSON ? employeeInstance.toJSON() : employeeInstance;
	return {
		id: plain.id,
		firstname: plain.firstname,
		lastname: plain.lastname,
		email: plain.email,
		role: plain.role,
		is_active: plain.is_active
	};
}

async function generateNextEmployeeId() {
	const lastEmployee = await Employee.findOne({
		order: [['created_at', 'DESC']],
		attributes: ['id']
	});

	if (!lastEmployee || !/^e\d+$/i.test(lastEmployee.id)) {
		return 'e1';
	}

	const currentNumber = parseInt(lastEmployee.id.slice(1), 10) || 0;
	return `e${currentNumber + 1}`;
}

exports.register = async (req, res) => {
	try {
		const {
			firstname,
			lastname,
			email,
			password,
			role = 'employee'
		} = req.body || {};

		if (!firstname || !lastname || !email || !password) {
			return res.status(400).json({ message: 'Firstname, lastname, email and password are required' });
		}

		const normalizedEmail = String(email).toLowerCase();

		const existing = await Employee.findOne({ where: { email: normalizedEmail } });
		if (existing) {
			return res.status(409).json({ message: 'An account already exists for this email address' });
		}

		const passwordHash = await hashPassword(password);
		const employeeId = await generateNextEmployeeId();

		const created = await Employee.create({
			id: employeeId,
			firstname,
			lastname,
			email: normalizedEmail,
			password_hash: passwordHash,
			role,
			is_active: true
		});

		const payload = {
			id: created.id,
			email: created.email,
			role: created.role
		};

		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		return res.status(201).json({
			user: sanitizeEmployee(created),
			tokens: { accessToken, refreshToken }
		});
	} catch (error) {
		console.error('Register error:', error);
		return res.status(500).json({ message: 'Unable to register user', error: error.message });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body || {};

		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' });
		}

		const normalizedEmail = String(email).toLowerCase();
		const user = await Employee.findOne({ where: { email: normalizedEmail } });

		if (!user) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		const storedHash = user.password_hash;
		let passwordMatches = false;

		if (storedHash && storedHash.startsWith('$2')) {
			passwordMatches = await comparePassword(password, storedHash);
		} else {
			passwordMatches = password === storedHash;
		}

		if (!passwordMatches) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		if (user.is_active === false) {
			await user.update({ is_active: true });
		}

		const payload = {
			id: user.id,
			email: user.email,
			role: user.role,
			company_id: user.company_id
		};

		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		return res.status(200).json({
			user: sanitizeEmployee(user),
			tokens: { accessToken, refreshToken }
		});
	} catch (error) {
		console.error('Login error:', error);
		return res.status(500).json({ message: 'Unable to login', error: error.message });
	}
};

exports.refreshToken = async (req, res) => {
	try {
		const { refreshToken } = req.body || {};

		if (!refreshToken) {
			return res.status(400).json({ message: 'Refresh token is required' });
		}

		const decoded = verifyRefreshToken(refreshToken);

		// Optionally revoke the used refresh token to enforce rotation
		revokeRefreshToken(refreshToken);

		const payload = {
			id: decoded.id,
			email: decoded.email,
			role: decoded.role
		};

		const accessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);

		return res.status(200).json({
			tokens: {
				accessToken,
				refreshToken: newRefreshToken
			}
		});
	} catch (error) {
		console.error('Refresh token error:', error);
		return res.status(401).json({ message: 'Invalid refresh token' });
	}
};

exports.logout = async (req, res) => {
	try {
		const { refreshToken } = req.body || {};
		if (refreshToken) {
			revokeRefreshToken(refreshToken);
		}
		return res.status(204).send();
	} catch (error) {
		console.error('Logout error:', error);
		return res.status(500).json({ message: 'Unable to logout' });
	}
};

exports.changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body || {};

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ message: 'Current password and new password are required' });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: 'New password must be at least 6 characters' });
		}

		// Get user ID from JWT token (set by ensureAuthenticated middleware)
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		// Find the user
		const user = await Employee.findByPk(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Verify current password
		const storedHash = user.password_hash;
		let passwordMatches = false;

		if (storedHash && storedHash.startsWith('$2')) {
			passwordMatches = await comparePassword(currentPassword, storedHash);
		} else {
			// Handle legacy plaintext passwords
			passwordMatches = currentPassword === storedHash;
		}

		if (!passwordMatches) {
			return res.status(401).json({ message: 'Current password is incorrect' });
		}

		// Check if new password is same as current
		if (currentPassword === newPassword) {
			return res.status(400).json({ message: 'New password must be different from current password' });
		}

		// Hash new password
		const newPasswordHash = await hashPassword(newPassword);

		// Update password
		await user.update({ password_hash: newPasswordHash });

		return res.status(200).json({ message: 'Password updated successfully' });
	} catch (error) {
		console.error('Change password error:', error);
		return res.status(500).json({ message: 'Unable to change password', error: error.message });
	}
};
