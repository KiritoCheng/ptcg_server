const { graphqlHTTP } = require("express-graphql");
const { query } = require("../../config/db");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { addResolversToSchema } = require("@graphql-tools/schema");
const { join } = require("path");

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

// Add resolvers to the schema
const schemaWithResolvers = addResolversToSchema({
  schema: loadSchemaSync(join(__dirname, "./card.graphql"), {
    loaders: [new GraphQLFileLoader()],
  }),
  resolvers: {},
});

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
    "/api/card",
    graphqlHTTP({
      schema: schemaWithResolvers,
      rootValue: root,
      graphiql: true,
    })
  );
};
