// Creates random string to be used as User IDs or short URLs
const generateRandomString = function (length) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const lengthOfCharacters = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.round(Math.random() * lengthOfCharacters));
  }
  return result;
};

// Checks if user exists by checking the user database
const checkUsersEmail = function (email, database) {
  const keys = Object.keys(database);

  for (const each of keys) {
    if (email === database[each]["email"]) {
      const user = database[each];
      return user;
    }
  }
  return null;
};

// Finds the long URLs for a single user ID
const urlsForUser = function (id, database) {
  const urls = {};

  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      urls[shortURL] = { longURL: database[shortURL].longURL };
    }
  }
  return urls;
};

module.exports = { generateRandomString, checkUsersEmail, urlsForUser };
