const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { query } = require("../../config/db");

const TABLE_NAME = "CATEGORY";
const SQL_GET_CATEGORY = `SELECT name FROM ${TABLE_NAME}`;

var schema = buildSchema(`
    interface res{
        res:Int
        errorInfo:String
    },
    type categoryTypes{
        "卡包名"
        name:String
    },
    type categoryRes implements res{
        res:Int,
        errorInfo:String,
        data:[categoryTypes],
    },
    type Query {
        getCategory:categoryRes
    },
`);

var root = {
  getCategory: async () => {
    return await query(SQL_GET_CATEGORY)
      .then((rtn) => {
        const resData = {
          res: 0,
          data: JSON.parse(JSON.stringify(rtn)),
        };
        return resData;
      })
      .catch((err) => {
        return {
          res: -1,
          errorInfo: err,
          data: [],
        };
      });
  },
};

module.exports = (app) => {
  app.use(
    "/api/category",
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
    })
  );
};
