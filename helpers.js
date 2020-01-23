function findUserByEmail(email, users) {
  for (const user of Object.values(users)) {
    if (user['email'] === email) {
      return user;
    }
  }
}

module.exports = { findUserByEmail };