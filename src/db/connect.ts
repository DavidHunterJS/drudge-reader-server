const mongoose = require("mongoose");

const path: string = process.cwd();
require("dotenv").config({
  path: path + "/.env"
});

let Db: any;
if (process.env.ATLAS_URI) {
  Db = process.env.ATLAS_URI;
}

exports.connectToServer = async () => {
  try {
    await mongoose.connect(Db);
    console.log("⚡️[database]: Successfully connected to Atlas-MongoDB.");
  } catch (error) {
    console.error(error);
  }
};
