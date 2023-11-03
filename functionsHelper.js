const generateRandomString = function(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const lengthOfCharacters = characters.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.round(Math.random() * lengthOfCharacters));
  }
  return result;
};


const checkUsersEmail = function(email, obj) {
  const keys = Object.keys(obj)

  for (const each of keys) {
    if (email === obj[each]['email']) {
      const user = obj[each]
      return user;
    }
  }
  return null;
};

// console.log(checkUsersEmail('b@b.com', users));
// checkUsersEmail('b@b.com', users);


const urlsForUser = function(id, urlDatabase) {
  const urls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = {longURL: urlDatabase[shortURL].longURL}
    }
  }


  return urls;
}

module.exports = { generateRandomString, checkUsersEmail, urlsForUser }