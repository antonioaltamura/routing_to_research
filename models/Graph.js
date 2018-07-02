let config = $require('./config'),
	neo4j = require('neo4j-driver').v1,
	driver = neo4j.driver(config.bolt, neo4j.auth.basic(config.user, config.password)),
	λ = require('./../utils');


class Graph {
	static async shortestPath(author1, author2) {
		try {
			console.log("in model", author1, author1)
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`
			MATCH (cs:Author { name: {a}}),(ms:Author { name: {b}}), p = shortestPath((cs)-[*]-(ms))
			WITH p
			WHERE length(p)> 1
			RETURN p
			`, {a: author1, b: author2});
			return (!res.records[0]) ? [] : res.records[0].get("p").segments.map(t => [
				{id: λ.toInt(t.start.identity), type: t.start.labels[0], name: t.start.properties.name},
				{id: λ.toInt(t.relationship.identity), type: t.relationship.type, name: t.relationship.properties.name},
				{id: λ.toInt(t.end.identity), type: t.end.labels[0], name: t.end.properties.name}
			]);
		} catch (e) {
			console.warn("Error in Graph model. Rethrowing error");
			console.warn(e)
			throw e;
		}
	}

	static async getAll() {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`
			MATCH (n1)-[r]->(n2) RETURN
			{type: labels(n1), id: id(n1), name: n1.name},
			{type: TYPE(r), id: id(r)},
			{type: labels(n2), id: id(n2), name: n2.name}
			`);
			return res.records.map(t => [
				{type: t.get(0).type[0], name: t.get(0).name, id: λ.toInt(t.get(0).id)},
				{type: t.get(1).type, id: λ.toInt(t.get(1).id)},
				{type: t.get(2).type[0], name: t.get(2).name, id: λ.toInt(t.get(2).id)}
			]);
		} catch (e) {
			console.warn("Error in Graph model. Rethrowing error");
			console.warn(e)
			throw e;
		}
	}

}

module.exports = Graph;
