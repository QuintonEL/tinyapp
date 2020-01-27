// find the user in the database
function findUserByEmail(email, users) {
  for (const user of Object.values(users)) {
    if (user['email'] === email) {
      return user;
    }
  }
}

// generates a random string to be used as the new short URL
const generateRandomString = function(length) {
  let newStr = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    newStr += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return newStr;
};

module.exports = { findUserByEmail, generateRandomString };