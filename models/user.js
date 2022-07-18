/** User class for message.ly */

const { DB_URI, SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expressCors = require('express-cors');
const ExpressError = require('../expressError');

/** User of the site. */

class User {
	constructor(username, password, first_name, last_name, phone) {
		this.username = username;
		this.password = password;
		this.first_name = first_name;
		this.last_name - last_name;
		this.phone = phone;
	}
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
			} else {
				throw new ExpressError('Incorrect username or password', 404);
			}
		}
		throw new ExpressError('Username not found', 400);
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		const results = await db.query(
			`UPDATE users SET last_login_at = current_timestamp WHERE username = $1 RETURNING username`,
			[ username ]
		);
	}

	/** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		const results = await db.query(`SELECT username, first_name, last_name, phone FROM users`);
		const users = results.rows.map((row) => new User(row.username, row.first_name, row.last_name, row.phone));
		return users;
	}

	/** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

	static async get(username) {
		const results = await db.query(
			`SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`,
			[ username ]
		);
		console.log(results.rows[0]);
		return results.rows[0];
	}

	/** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

	static async messagesFrom(username) {
		const results = await db.query(
			`SELECT 
       f.username AS from_username,
       m.id AS message_id,
       t.username AS to_username,
       t.first_name AS to_first_name,
       t.last_name AS to_last_name,
       t.phone AS to_phone,
       body,
       sent_at,
       read_at
       FROM messages AS m 
       JOIN users AS f ON m.from_username = f.username
       JOIN users AS t ON m.to_username = t.username
       WHERE f.username = $1
       ORDER BY sent_at`,
			[ username ]
		);
		console.log(results.rows);
		return results.rows;
	}

	/** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

	static async messagesTo(username) {
		const results = await db.query(
			`SELECT 
       m.id AS message_id,
       u.username AS from_username,
       u.first_name AS from_first_name,
       u.last_name AS from_last_name,
       u.phone AS from_phone,
       body,
       sent_at,
       read_at 
       FROM messages AS m
       JOIN users AS u ON u.username = m.from_username
       WHERE to_username = $1`,
			[ username ]
		);
		console.log(results.rows);
		return results.rows;
	}
}

module.exports = User;
