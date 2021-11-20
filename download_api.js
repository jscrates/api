// import { MongoClient } from "mongodb";
const MongoClient  = require('mongodb').MongoClient;
const dbConnectionUrl = "mongodb+srv://jscrates:rGlUXmia8napAGk0@cluster0.zouwc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

function initialize(
    dbName,
    dbCollectionName,
    successCallback,
    failureCallback
) {
    MongoClient.connect(dbConnectionUrl, function(err, dbInstance) {
        if (err) {
            console.log(`Database Connection Failed`);
            failureCallback(err); 
        } else {
            const dbObject = dbInstance.db(dbName);
            const dbCollection = dbObject.collection(dbCollectionName);
            console.log("Database Connection Successful");

            successCallback(dbCollection);
        }
    });
}

module.exports = initialize;


