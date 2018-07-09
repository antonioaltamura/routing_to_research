/**
 * Created by Antonio Altamura on 05/06/2018.
 */
let config = $require('./config'),
	neo4j = require('neo4j-driver').v1,
	driver = neo4j.driver(config.bolt, neo4j.auth.basic(config.user, config.password)),
	λ = require('./../utils');


module.exports = class Journal {

	constructor({name, papers = [], topics = [], notes = "", date = "", isbn = "", number = "", id = null}) {
		this.id = id;
		this.name = name;
		this.isbn = isbn;
		this.date = date;
		this.number = number;
		this.notes = notes;
		this.papers = papers;
		this.topics = topics;
	}

	async save() {
		const session = driver.session(neo4j.session.READ);
		try {

			let q;
			let params = {id: this.id, name: this.name, data: {}};
			if (this.isbn) params.data.isbn = this.isbn;
			if (this.date) params.data.date = this.date;
			if (this.number) params.data.number = this.number;
			if (this.notes) params.data.notes = this.notes;
			params.papers = this.papers || [];
			params.topics = this.topics || [];
			//node update
			if (this.id) {
				q = `MATCH (n:Journal) WHERE id(n) = toInteger({id})
				SET n.name = {name}
				SET n += {data}
				MERGE (x)-[r1:PUBLISHED_IN]->(n) DELETE r1
				MERGE (n)-[r2:HAS_KEYWORD]->(y) DELETE r2
				FOREACH(a IN {papers} |
				  MERGE (paper:Paper { name: a.name })
				  MERGE (paper)-[:PUBLISHED_IN]->(n))
				FOREACH(t IN {topics} |
				  MERGE (topic:Topic { name: t.name })
				  MERGE (n)-[:HAS_KEYWORD]->(topic))`;
			}
			//node creation
			else {
				q = `MERGE (n:Journal {name: {name}})
				SET n += {data}
				MERGE (x)-[r1:PUBLISHED_IN]->(n) DELETE r1
				MERGE (n)-[r2:HAS_KEYWORD]->(y) DELETE r2
				FOREACH(a IN {papers} |
				  MERGE (paper:Paper { name: a.name })
				  MERGE (paper)-[:PUBLISHED_IN]->(n))
				FOREACH(t IN {topics} |
				  MERGE (topic:Topic { name: t.name })
				  MERGE (n)-[:HAS_KEYWORD]->(topic))`;
			}

			console.log(q);
			let r = await session.run(q, params);
			session.close();
			return r;
		} catch (e) {
			console.warn("Error in Journal model. Rethrowing error");
			console.warn(e)
			throw e;
		}
	}

	static toObject(record) {
		try {
			return {
				id: λ.toInt(record.get('n').identity),
				...record.get('n').properties,
				papers: λ.formatNeo4jArray(record.get("papers")),
				topics: λ.formatNeo4jArray(record.get("topics"))
			}
		} catch (e) {
			console.log(e)
		}
	}

	static async getByNameContains(str) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Journal) WHERE n.name =~ {str}
			RETURN n, [] AS papers, [] as topics`, {str: `(?i).*${str}.*`});
			session.close();
			return res.records.map(record => new Journal({...Journal.toObject(record)}))
		} catch (e) {
			console.warn("Error in Journal model. Rethrowing error");
			throw e;
		}
	}

	static async getByName(name) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Journal {name:{name}}})
			RETURN n, [] AS papers, [] as topics`, {name: name});
			session.close();
			return res.records.map(record => new Journal({...Journal.toObject(record)}))
		} catch (e) {
			console.warn("Error in Journal model. Rethrowing error");
			throw e;
		}
	}

	static async getById(id) {
		if (typeof id !== "number") throw "Check id type";

		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Journal) WHERE id(n) = toInteger({id})
						OPTIONAL MATCH (a:Paper)-[:PUBLISHED_IN]->(n)
						OPTIONAL MATCH (n)-[:HAS_KEYWORD]->(b:Topic)
						RETURN n,
						collect(DISTINCT { name:a.name, id:id(a)}) AS papers,
						collect(DISTINCT { name:b.name, id:id(a)}) AS topics
			`, {id: id});
			session.close();
			return res.records.map(record => new Journal({...Journal.toObject(record)}))[0]
		} catch (e) {
			console.warn("Error in Journal model. Rethrowing error");
			console.warn(e)
			throw e;
		}
	}

	static async getAll() {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Journal)
			RETURN n, [] AS papers, [] as topics`);
			session.close();
			return res.records.map(record => new Journal({...Journal.toObject(record)}))
		} catch (e) {
			console.warn("Error in Journal model. Rethrowing error");
			throw e;
		}
	}

	static async delete(id) {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run("MATCH (a:Journal) WHERE id(a) = toInteger({id}) DETACH DELETE a", {id: id});
			session.close();
			return r;
		} catch (e) {
			console.warn("Error deleting Journal. Rethrowing error");
			console.log(e)
			throw e;
		}
	}

	static async count() {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run("MATCH (n:Journal) RETURN DISTINCT count(n) AS count");
			session.close();
			return λ.toInt(r.records[0].get("count"));
		} catch (e) {
			console.warn("Error counting Journal. Rethrowing error");
			console.log(e)
			throw e;
		}
	}

}


