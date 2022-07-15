/** User class for message.ly */

const { DB_URI, SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expressCors = require('express-cors');
const ExpressError = require('../expressError');

/** User of the site. */

class User {
	/** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

	static async register(username, password, firstName, lastName, phone) {
		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		console.log(hashedPassword);
		const results = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) RETURNING *`,
			[ username, hashedPassword, firstName, lastName, phone ]
		);
		return results.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		const results = await db.query(`SELECT username, password FROM users WHERE username = $1`, [ username ]);
		const user = results.rows[0];
		if (user) {
			if (await bcrypt.compare(password, user.password)) {
				const token = jwt.sign({ username: `${user.username}` }, SECRET_KEY);
				return { token };
			}
		}
		throw new ExpressError('Username not found', 400);
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {}

	/** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

	static async all() {}

	/** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

	static async get(username) {}

	/** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

	static async messagesFrom(username) {}

	/** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

	static async messagesTo(username) {}
}

module.exports = User;
