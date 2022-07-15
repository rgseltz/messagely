const express = require('express');
const ExpressError = require('../expressError');
const User = require('../models/user');
const router = express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;
		if (!username || !password) {
			throw new ExpressError('Username and password required', 404);
		}
		const user = await User.authenticate(username, password);
		return res.json(user);
	} catch (err) {
		return next(err);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
	try {
		const { username, password, firstName, lastName, phone } = req.body;
		if (!username || !password) {
			throw new ExpressError('Username and password required', 404);
		}
		const user = await User.register(username, password, firstName, lastName, phone);
		return res.json(user);
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
