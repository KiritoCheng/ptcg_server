const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { query } = require("../config/db");

const TABLE_NAME = "POKEMON_CARD_INFO";
const pageSize = "10";
const SQL_GET_POKEMON = ({ category, page }) => {
  const categoryFilter = category === "" ? "" : `WHERE category="${category}"`;
  return `SELECT 
    id
    pid
    category
    name
    hp
    p_type
    abilitys
    power
    weakness_type
    resistance_type
    weakness_number
    resistance_number
    escape
    img 
  FROM ${TABLE_NAME} ${categoryFilter} group by id order by id limit ${page} ,${pageSize}`;
};

var schema = buildSchema(`
    interface res {
        res:Int
        errorInfo:String
    },
    type powerTypes {
      "技能费用"
      cost:String
      "技能名"
      skill:String
      "技能说明"
      content:String
    }
    type poekmonTypes implements powerTypes {
      id:Int
      pid:Int
      "分类"
      category:String
      "名字"
      name:String
      "血量"
      hp:Int
      "属性"
      p_type:String
      "能力"
      abilitys:powerTypes
      "技能"
      power:[powerTypes]
      "弱点属性"
      weakness_type:String
      "抵抗属性"
      resistance_type:String
      "弱点计算"
      weakness_number:String
      "抵抗计算"
      resistance_number:String
      "撤退花费"
      escape:Int
      "原画"
      img:String
    },
    type poekmonRes implements res {
        res:Int,
        errorInfo:String,
        data:[poekmonTypes],
    },
    type Query {
        getPokem(category:String,page:Int):poekmonRes
    },
    type Mutation {}
`);

var root = {
  getPokemon: async (req) => {
    const { category = "", page = 0 } = req;
    return await query(SQL_GET_POKEMON({ category, page: page * pageSize }))
      .then((rtn) => {
        console.log(rtn);
        //     const resData = {
        //       res: 0,
        //       data: JSON.parse(JSON.stringify(rtn)),
        //     };
        //     return resData;
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
    "/api/pokemon",
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
    })
  );
};
