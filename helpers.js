const getUserByEmail = (email, database) => {  //Return user if email is im the database
  // console.log(email, database)
  for (const user in database) {

    if (database[user]["email"] === email) {
      return database[user];
    }
  }
  return false;
};


const getUserUrls = (db, cookieUser) => {
  // console.log(db, cookieUser)
  let userUrls = {};

  for (let key of Object.keys(db)) {
    if (db[key]["user_id"] === cookieUser) {
      userUrls[key] = {
        longURL: db[key]["longURL"],
        user_id: db[key]["user_id"],
      };
    }

  }
  console.log(userUrls)
  return userUrls;
};

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
}




module.exports = { getUserByEmail, getUserUrls,  generateRandomString};