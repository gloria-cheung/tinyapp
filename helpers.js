// when new users are made through registration, pushed onto this empty object
const users = {};
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(2,8);
};

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

const createNewUser = function(email, hashedPassword) {
  const ID = generateRandomString();
  users[ID] = {
    id: ID,
    email: email,
    hashedPassword: hashedPassword
  };
  return users[ID];
};

const urlsForUser = function(id, database) {
  const urls = {};
  for (let url in database) {
    if (database[url].userID === id) {
      urls[url] = {};
      urls[url] = database[url];
    }
  }
  return urls;
};

module.exports = { users, urlDatabase, getUserByEmail, generateRandomString, createNewUser, urlsForUser };