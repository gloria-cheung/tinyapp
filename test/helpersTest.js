const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe("getUserByEmail", () => {
  it("should return true for a user with valid email (user 1)", () => {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });

  it("should return true for a user with valid email (user 2)", () => {
    const user = getUserByEmail("user2@example.com", testUsers)
    const expectedUserID = "user2RandomID";
    assert.deepEqual(user.id, expectedUserID);
  });

  it("should return null for a user with invalid email", () => {
    const user = getUserByEmail("hello@example.com", testUsers)
    assert.deepEqual(user, null);
  });
});