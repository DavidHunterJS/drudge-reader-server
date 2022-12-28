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
        console.log("Successfully connected to MongoDB.");

        // SUBSCRIPTION TO REAL-TIME DB CHANGES USING CHANGESTREAM
        _db = db.db("dr");
        const collection = _db.collection("links");
        const changeStream = collection.watch();
        changeStream.on("change", (change: Object[]) => {
          console.log(
            `There was a change to the collection, This is when we send the data to the client.`
          );
        });
      }
      return callback(err);
    });
  },

  getDb: function () {
    return _db;
  }
};
