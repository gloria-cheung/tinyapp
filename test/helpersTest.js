const { assert } = require('chai');

const { getUserByEmail, generateRandomString, createNewUser, urlsForUser } = require('../helpers.js');

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

const testURLs = {
  b6fTxQ: {
    longURL: "https://www.hello.ca",
    userID: "qweqwe"
  },
  isBdGr: {
    longURL: "https://www.goodbye.ca",
    userID: "asdasd"
  }
};

describe("getUserByEmail", () => {
  it("should return true for a user with valid email (user 1)", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });

  it("should return true for a user with valid email (user 2)", () => {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedUserID = "user2RandomID";
    assert.deepEqual(user.id, expectedUserID);
  });

  it("should return null for a user with invalid email", () => {
    const user = getUserByEmail("hello@example.com", testUsers);
    assert.deepEqual(user, null);
  });
});

describe("generateRandomString", () => {
  it("should return true when each time generate a new string is not equal", () => {
    const str1 = generateRandomString();
    const str2 = generateRandomString();
    assert.notEqual(str1, str2);
  });
});

describe("createNewUser", () => {
  it("should return true if new user is created", () => {
    const user = createNewUser("hello@gmail.com", "asdasdasd", testUsers);
    assert.equal(user.id, testUsers[user.id].id);
  });
});

describe("urlsForUser", () => {
  it("should return true if urls for user matches", () => {
    const urls = urlsForUser("asdasd", testURLs);
    assert.equal(urls.isBdGr.longURL,"https://www.goodbye.ca");
  });
});

