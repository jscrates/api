// import express from "express";
// import pkg from "body-parser";
// import db from "./download_api";

const express = require("express");
const json = require("body-parser");
const initialize = require("./download_api");
const { request } = require("express");

const server = express();
// parse JSON (application/json content-type)
server.use(json());

const port = 4000;

// << db setup >>
const dbName = "jscrates";
const collectionName = "packages";

// << db CRUD routes >>
server.get("/pkg/:package/:version?", async (_request, response) => {
  // dbCollection.find().toArray((error, result) => {
  //     if (error) throw error;
  //     response.json(result);
  // });
  // << db init >>
  // successCallback
  const packageName = _request.params.package;
  const packageVersion = _request.params.version;
  if (!packageName) {
    return response.status(400).json({
      message: "Package Name Required",
    });
  }
  initialize(
    dbName,
    collectionName,
    function (dbCollection) {
      // get all items
      if (packageVersion) {
        // dbCollection.find({name:packageName,'versions.version':{$eq:packageVersion}}).toArray(function(err, result) {
        //     if (err) throw err;
        //       console.log(result);
        //       return response.json(result);
        // });
        const dbrand = dbCollection
          .aggregate([
            {
              $match: {
                name: packageName,
              },
            },
            {
              $project: {
                versions: {
                  $filter: {
                    input: "$versions",
                    as: "version",
                    cond: { $eq: ["$$version.version", packageVersion] },
                  },
                },
              },
            },
          ])
          .toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            return response.json(result);
          });
      } else {
        dbCollection
          .find({ name: packageName })
          .toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            const { versions, ...pkgmeta } = result[0];
            return response.json({ ...pkgmeta, version: versions[0] });
          });
      }

      // failureCallback
    },
    function (err) {
      throw err;
    }
  );
  // dbCollection.findOne({ id: itemId }, (error, result) => {
  //     if (error) throw error;
  //     // return item
  //     response.json(result);
  // });
});
server.listen(port, () => {
  console.log(`Listening at ${port}`);
});
