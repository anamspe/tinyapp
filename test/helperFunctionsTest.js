const { assert } = require("chai");

const { checkUsersEmail, urlsForUser } = require("../helperFunctions.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const testDatabase = {
  "4a2b9c": {
    longURL: "https://www.example.com",
    userID: "abc123",
  },
  "3d35e9f": {
    longURL: "https://www.google.com",
    userID: "def123",
  },
};

describe("checkUsersEmail", () => {
  it("should return a user with valid email", () => {
    const user = checkUsersEmail("user@example.com", testUsers).id;
    const expectedUserID = "userRandomID";

    assert.equal(user, expectedUserID);
  });

  it("should return null for an invalid email", () => {
    const fakeUser = checkUsersEmail("a@a.com", testUsers);
    const expected = null;

    assert.equal(fakeUser, expected);
  });
});

describe("urlsForUser", () => {
  it("should return an empty object for a invalid id", () => {
    const urls = urlsForUser("xQ67h3", testDatabase);
    const expected = {};

    assert.deepEqual(urls, expected);
  });

  it("should return the short URL object with the long URL for the right id", () => {
    const userID = urlsForUser("def123", testDatabase);
    const expected = {
      "3d35e9f": {
        longURL: "https://www.google.com",
      },
    };

    assert.deepEqual(userID, expected);
  });
});
