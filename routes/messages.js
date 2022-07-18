const express = require('express');
const router = express.Router();
const db = require('../db');
const { ensureLoggedIn } = require('../middleware/auth');
const Message = require('../models/message');
const User = require('../models/user');
const { messagesFrom } = require('../models/user');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
	try {
		const { id } = req.params;
		const message = await Message.get(id);
		return res.status(200).json(message);
	} catch (err) {
		return next(err);
	}
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
	const { from_username, to_username, body } = req.body;
	// const sender = await User.get(from_username);
	// const recipient = await User.get(to_username);
	const message = await Message.create(from_username, to_username, body);
	res.status(201).json({ message });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

module.exports = router;
