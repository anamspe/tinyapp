const generateRandomString = function(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const lengthOfCharacters = characters.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.round(Math.random() * lengthOfCharacters));
  }
  return result;
};

const checkUsers = function(email, obj) {
  const keys = Object.keys(obj)

  for (const each of keys) {
    if (email === obj[each]['email']) {
      return obj[each];
    }
    return null;
  }
};



module.exports = { generateRandomString, checkUsers }