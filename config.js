/**
 * Created by Antonio Altamura on 14/06/2018.
 */
"use strict";

/**
 * If Heroku GrapheneDB env vars are defined use them, otherwise use local config
* */
module.exports = {
	bolt: process.env.GRAPHENEDB_BOLT_URL ? process.env.GRAPHENEDB_BOLT_URL : "bolt://localhost:7687",
	user: process.env.GRAPHENEDB_BOLT_USER ? process.env.GRAPHENEDB_BOLT_USER : "neo4j",
	password: process.env.GRAPHENEDB_BOLT_PASSWORD ? process.env.GRAPHENEDB_BOLT_PASSWORD : "neo4jneo4j"
};