const { assert } = require('chai');
const  { findUserByEmail }  = require('../helpers');

// test user database
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, testUsers[expectedOutput]);
  });

  it('should return undefined for a non-existent email', function() {
    const user = findUserByEmail("user@user.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  })
});