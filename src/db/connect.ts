const path = process.cwd();
require("dotenv").config({
  path: path + "/.env"
});

const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let _db: any;

module.exports = {
  connectToServer: (callback: any) => {
    client.connect((err: any, db: any) => {
      if (db) {
        _db = db.db("dr");
        console.log("Successfully connected to MongoDB.");
      }
      return callback(err);
    });
  },

  getDb: function () {
    return _db;
  }
};
