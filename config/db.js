const mysql = require("mysql");

const userInfo = {
  host: "136.244.66.213",
  user: "root",
  password: "Kirito123",
  port: "3306",
  database: "ptcg",
  charset: "UTF8_GENERAL_CI",
};

// add connection
const pool = mysql.createPool(userInfo);

const connect = function () {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
        console.log("[connect_err] - :" + err);
        return;
      }

      console.log("connected!");
      resolve(connection);
    });
  });
};

const query = function (sql, param) {
  return new Promise((resolve, reject) => {
    connect()
      .then((connection) => {
        // queries here, when all queries are finished you do connection.release() to return the connection back to the pool
        connection.query(sql, param, (err, rows) => {
          if (err) {
            reject(err);
            console.log("[sql] - :" + sql);
            console.log("[query_err] - :" + err);
            return;
          }
          resolve(rows);
          connection.release();
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = { query, connect };
