/**
 * Created by Antonio Altamura on 05/06/2018.
 */
"use strict";
let neo4j = require('neo4j-driver').v1;
let driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "neo4jneo4j"));

var path = require("path");
global.$require = function(mod){
	return require(path.join(__dirname, mod));
};

let Paper = require("./models/Paper");
let λ = require('./utils')


async function init_db() {

	const session = driver.session(neo4j.session.READ);
	try{

		await session.run(`MATCH (n) DETACH DELETE n`);
		console.warn("DB cleared!");

		let res = await session.run(`
		LOAD CSV WITH HEADERS FROM "file:///Paper.csv" AS r FIELDTERMINATOR ';'
CREATE (p:Paper {
  nodeId: toInteger(r.\`nodeId:ID(Paper)\`),
  name: r.name,
  date: r.date,
  file: r.file
})
RETURN count(*) AS c
`);
		console.warn("Paper added " + λ.toInt(res.records[0].get('c')));

		res = await session.run(`
LOAD CSV WITH HEADERS FROM "file:///Paper_data.csv" AS r FIELDTERMINATOR ';'
MATCH (a:Paper {nodeId: toInteger(r.\`id:ID(Paper)\`)})
SET a.abstract = r.abstract
RETURN count(*) AS c
`);
		console.warn("Paper data added " + λ.toInt(res.records[0].get('c')));


		res = await session.run(`LOAD CSV WITH HEADERS FROM "file:///Book.csv" AS r FIELDTERMINATOR ';'
CREATE (p:Book {
  nodeId: toInteger(r.\`nodeId:ID(Book)\`),
  name: r.name,
  date: r.date,
  file: r.file
})
RETURN count(*) AS c
`);
		console.warn( "Book added " + λ.toInt(res.records[0].get('c')));

		res = await session.run(`LOAD CSV WITH HEADERS FROM "file:///Journal.csv" AS r FIELDTERMINATOR ';'
CREATE (p:Journal {
  nodeId: toInteger(r.nodeId),
  name: r.name,
  date: r.date,
  volume:toInteger(r.volume),
  issue:toInteger(r.issue)
})
RETURN count(*) AS c
`);
		console.warn( "Journal added " + λ.toInt(res.records[0].get('c')));

		res = await session.run(`LOAD CSV WITH HEADERS FROM "file:///Author_HAS_WRITTEN_Paper.csv" AS r FIELDTERMINATOR ';'
MERGE (a:Author {name: r.name})
WITH a AS a, r AS r
MATCH (g:Paper {nodeId: toInteger(r.\`:END_ID(Paper)\`)})
CREATE (a)-[:HAS_WRITTEN]->(g)
RETURN count(*) AS c
`);
		console.warn( "Author_HAS_WRITTEN_Paper added " + λ.toInt(res.records[0].get('c')));

		res = await session.run(`LOAD CSV WITH HEADERS FROM "file:///Author_HAS_WRITTEN_Book.csv" AS r FIELDTERMINATOR ';'
MERGE (a:Author {name: r.name})
WITH a AS a, r AS r
MATCH (g:Book {nodeId: toInteger(r.\`:END_ID(Book)\`)})
CREATE (a)-[:HAS_WRITTEN]->(g)
RETURN count(*) AS c
`);
		console.warn( "Author_HAS_WRITTEN_Book added " + λ.toInt(res.records[0].get('c')));

		res = await session.run(`
LOAD CSV WITH HEADERS FROM "file:///Paper_HAS_KEYWORD_Topic.csv" AS r FIELDTERMINATOR ';'
MATCH (a:Paper {nodeId: toInteger(r.\`:START_ID(Paper)\`)})
WITH a AS a, r AS r
MERGE (t:Topic {name:r.topic})
CREATE (a)-[:HAS_KEYWORD]->(t)
RETURN count(*) AS c
`);
		console.warn( "Paper_HAS_KEYWORD_Topic added " + λ.toInt(res.records[0].get('c')));

		res = await session.run(`
LOAD CSV WITH HEADERS FROM "file:///Paper_PUBLISHED_IN_Journal.csv" AS r FIELDTERMINATOR ';'
MATCH (a:Paper {nodeId: toInteger(r.\`:START_ID(Paper)\`)})
MATCH (j:Journal {nodeId: toInteger(r.\`:END_ID(Journal)\`)})
WITH a,r,j
CREATE (a)-[:PUBLISHED_IN]->(j)
RETURN count(*) AS c
`);
		console.warn( "Paper_PUBLISHED_IN_Journal added " + λ.toInt(res.records[0].get('c')));

	} catch (e) {
		console.warn("Somehow somewhere something is gone wrong");
		console.warn(e)
		throw (e)
	}

}

init_db()
	.then( () => {
		console.warn(λ.southPark() + `
		The DB has been correctly initialized\n\n`)
		process.exit()


	})
	.catch( () => {
		console.warn("Somehow somewhere something is gone wrong")
		process.exit()

	})