const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { query } = require("../config/db");
// const { card } = require("./card.graphiql");

const schema = await loadSchema("graphql/*.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const POKEMON_TABLE_NAME = "POKEMON_CARD_INFO";
const TRAINER_TABLE_NAME = "TRAINER_CARD_INFO";

const pageSize = "10";
const SQL_GET_POKEMON = ({ category, page }) => {
  const categoryFilter = category === "" ? "" : `WHERE category="${category}"`;
  return `SELECT 
    id,
    pid,
    category,
    name,
    hp,
    p_type,
    abilitys,
    power,
    weakness_type,
    resistance_type,
    weakness_number,
    resistance_number,
    escape,
    img
  FROM ${POKEMON_TABLE_NAME} ${categoryFilter} group by id order by id limit ${page} ,${pageSize}`;
};

const SQL_GET_TRAINER = ({ category, page }) => {
  const categoryFilter = category === "" ? "" : `WHERE category="${category}"`;
  return `SELECT 
    id,
    tid,
    category,
    name,
    t_type,
    effect,
    img
  FROM ${TRAINER_TABLE_NAME} ${categoryFilter} group by id order by id limit ${page} ,${pageSize}`;
};

console.log(card);

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
      "伤害"
      damage:String
      "技能说明"
      content:String
    },
    type pokemonTypes {
      id:Int
      pid:String
      "分类"
      category:String
      "名字"
      name:String
      "血量"
      hp:Int
      "属性"
      p_type:String
      "能力"
      abilitys:[powerTypes]
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
    type trainerRes implements res {
      res:Int,
      errorInfo:String,
      data:[trainerTypes],
  },
    type pokemonRes implements res {
        res:Int,
        errorInfo:String,
        data:[pokemonTypes],
    },
    type Query {
      getPokemonList(category:String,page:Int):pokemonRes
      getTrainerList(category:String,page:Int):trainerRes
    }
`);

var root = {
  getPokemonList: async (req) => {
    //category 分类，不传默认全部, page 页数，不传默认第一页
    const { category = "", page = 0 } = req;
    return await query(SQL_GET_POKEMON({ category, page: page * pageSize }))
      .then((rtn) => {
        const rtnData = JSON.parse(JSON.stringify(rtn)).map((k) => {
          const powerList = JSON.parse(`[${k.power}]`);
          const abilityList = JSON.parse(`[${k.abilitys}]`);

          return {
            ...k,
            abilitys: abilityList,
            power: powerList,
          };
        });

        return {
          res: 0,
          data: rtnData,
        };
      })
      .catch((err) => {
        return {
          res: -1,
          errorInfo: err,
          data: [],
        };
      });
  },

  getTrainerList: async (req) => {
    //category 分类，不传默认全部, page 页数，不传默认第一页
    const { category = "", page = 0 } = req;

    return await query(SQL_GET_TRAINER({ category, page: page * pageSize }))
      .then((rtn) => {
        return {
          res: 0,
          data: JSON.parse(JSON.stringify(rtn)),
        };
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
