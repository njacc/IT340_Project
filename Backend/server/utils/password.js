'use strict';

/*
 * All password hashing lives in this one file.
 * bcrypt adds a random salt to every hash and is deliberately slow, which
 * makes stolen hashes very hard to crack.
 */

const bcrypt = require('bcrypt');

const ROUNDS = 12;

// A hash of a throwaway password. Login compares against it when the email
// doesn't exist, so "no such user" and "wrong password" take the same time.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', ROUNDS);

exports.hashPassword = plain => bcrypt.hash(plain, ROUNDS);
exports.verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);
exports.DUMMY_HASH = DUMMY_HASH;
