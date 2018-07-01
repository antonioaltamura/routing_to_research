let config = $require('./config'),
	neo4j = require('neo4j-driver').v1,
	driver = neo4j.driver(config.bolt, neo4j.auth.basic(config.user, config.password)),
	λ = require('./../utils');
const util = require('util');

module.exports = class Paper {

	constructor({name, doi, authors = [], topics = [], date = "", abstract = "", notes = "", file = "", id = null}) {
		this.id = id;
		this.name = name;
		this.doi = doi;
		this.date = date;
		this.file = file;
		this.abstract = abstract;
		this.notes = notes;
		this.authors = authors;
		this.topics = topics;
	}

	async save() {
		const session = driver.session(neo4j.session.READ);
		try {
			let q;
			let params = {id: this.id, name: this.name, data: {}};

			/* NEW parametrized VERSION: params are automatically escaped against injection (and syntax error)
			*/
			if (this.doi) params.data.doi = this.doi;
			if (this.date) params.data.date = this.date;
			if (this.file) params.data.file = this.file;
			if (this.abstract) params.data.abstract = this.abstract;
			if (this.notes) params.data.notes = this.notes;
			params.authors = this.authors || [];
			params.topics = this.topics || [];

			//node update
			if (this.id) {
				q = `MATCH (n:Paper) WHERE id(n) = toInteger({id})
				SET n.name = {name}
				SET n += {data}
				MERGE (_)-[r1:HAS_WRITTEN]->(n) DELETE r1
				MERGE (_)-[r2:HAS_KEYWORD]->(n) DELETE r2
				FOREACH(a IN {authors} |
				  MERGE (author:Author { name: a.name })
				  MERGE (author)-[:HAS_WRITTEN]->(n))
				FOREACH(t IN {topics} |
				  MERGE (topic:Topic { name: t.name })
				  MERGE (n)-[:HAS_KEYWORD]->(topic))`;

				/* OLD unescaped version
				q = `MATCH (n:Paper) WHERE id(n) = toInteger(${this.id})
					SET n.name = '${this.name}'
					${this.doi ? `SET n.doi = '${this.doi}'` : ''}
					${this.date ? `SET n.date = '${this.date}'` : ''}
					${this.file ? `SET n.file = '${this.file}'` : ''}
					${this.abstract ? `SET n.abstract = '${this.abstract}'` : ''}
					${this.notes ? `SET n.notes = '${this.notes}'` : ''}
					MERGE (x)-[r1:HAS_WRITTEN]->(n) DELETE r1
					MERGE (y)-[r2:HAS_KEYWORD]->(n) DELETE r2
				${this.authors.length ? this.authors.map((a,i) =>
						`MERGE (a${i}:Author { name: '${a.name}' })
					MERGE (a${i})-[:HAS_WRITTEN]->(n)`
					).join('\n      ') : ''}
				${this.topics.length ? this.topics.map((b,i) =>
						`MERGE (b${i}:Topic { name: '${b.name}' })
				MERGE (n)-[:HAS_KEYWORD]->(b${i})`
					).join('\n') : ''}`; */
			}
			else {
				//node creation
				q = `
				MERGE (n:Paper {name: {name}})
				SET n += {data}
				MERGE (_)-[r1:HAS_WRITTEN]->(n) DELETE r1
				MERGE (_)-[r2:HAS_KEYWORD]->(n) DELETE r2
				FOREACH(a IN {authors} |
				  MERGE (author:Author { name: a.name })
				  MERGE (author)-[:HAS_WRITTEN]->(n))
				FOREACH(t IN {topics} |
				  MERGE (topic:Topic { name: t.name })
				  MERGE (n)-[:HAS_KEYWORD]->(topic))`;
				/* OLD unescaped version
				q = `MERGE (n:Paper {name: "${this.name}"})
                ${this.doi ? `SET n.doi = '${this.doi}'` : ''}
                ${this.date ? `SET n.date = '${this.date}'` : ''}
                ${this.file ? `SET n.file = '${this.file}'` : ''}
                ${this.abstract ? `SET n.abstract = '${this.abstract}'` : ''}
                ${this.notes ? `SET n.notes = '${this.notes}'` : ''}
            ${this.authors.length ? this.authors.map((a,i) =>
					`MERGE (a${i}:Author { name: '${a.name}' })
                MERGE (a${i})-[:HAS_WRITTEN]->(n)`
				).join('\n      ') : ''}
			${this.topics.length ? this.topics.map((b,i) =>
					`MERGE (b${i}:Topic { name: '${b.name}' })
			MERGE (n)-[:HAS_KEYWORD]->(b${i})`
				).join('\n') : ''}`;*/
			}
			console.log(q);
			let r = await session.run(q, params);
			session.close();
			return r;


		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			throw e;
		}
	}

	static toObject_old(record) {
		return {
			id: λ.toInt(record.get("id")),
			name: record.get("name"),
			doi: record.get("doi"),
			date: record.get("date"),
			file: record.get("file"),
			abstract: record.get("abstract"),
			notes: record.get("notes"),
			authors: λ.formatNeo4jArray(record.get("authors")),
			topics: λ.formatNeo4jArray(record.get("topics"))
		}
	}

	static toObject(record) {
		try {
			return {
				id: λ.toInt(record.get('n').identity),
				...record.get('n').properties,
				authors: λ.formatNeo4jArray(record.get("authors")),
				topics: λ.formatNeo4jArray(record.get("topics"))
			}
		} catch (e) {
			console.log(e)
		}
	}

	static async getByNameContains(str) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Paper) WHERE n.name =~ '(?i).*${str}.*'
			RETURN n, [] as authors, [] as topics`);
			session.close();
			return res.records.map(record => new Paper({...Paper.toObject(record)}))
		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			console.log(e)
			throw e;
		}
	}

	static async getByName(name) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Paper {name:{name}}}) RETURN n, [] as authors, [] as topics`, {name: name});
			session.close();
			return res.records.map(record => new Paper({...Paper.toObject(record)}))
		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			throw e;
		}
	}

	static async query(o) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Paper ${util.inspect(o)})
			OPTIONAL MATCH (a)-[:HAS_WRITTEN]->(n)
			OPTIONAL MATCH (n)-[:HAS_KEYWORD]->(k)
			RETURN n,
			collect(DISTINCT { name:a.name, id:id(a)}) AS authors,
			collect(DISTINCT { name:k.name, id:id(k)}) AS topics
			`);
			session.close();
			return res.records.map(record => new Paper(Paper.toObject(record)))
		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			throw e;
		}
	}

	static async getById(id) {
		if (typeof id !== "number") throw "Check id type";

		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Paper) WHERE id(n) = toInteger({id})
						OPTIONAL MATCH (a)-[:HAS_WRITTEN]->(n)
						OPTIONAL MATCH (n)-[:HAS_KEYWORD]->(k)
			RETURN n,
			collect(DISTINCT { name:a.name, id:id(a)}) AS authors,
			collect(DISTINCT { name:k.name, id:id(k)}) AS topics			
			`, {id: id})
			session.close();
			return res.records.map(record => new Paper({...Paper.toObject(record)}))[0]
		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			throw e;
		}
	}

	static async getAll(next) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Paper)
        RETURN n, [] as authors, [] as topics`);
			session.close();
			return res.records.map(record => new Paper({...Paper.toObject(record)}))
		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			throw e;
		}
	}

	static async delete(id) {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run(`MATCH (a:Paper) WHERE id(a) = toInteger({id}) DETACH DELETE a`, {id: id});
			session.close();
			return r;
		} catch (e) {
			console.warn("Error deleting Paper. Rethrowing error");
			console.log(e)
			throw e;
		}
	}

	static async count() {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run("MATCH (n:Paper) RETURN DISTINCT count(n) AS count");
			session.close();
			return λ.toInt(r.records[0].get("count"));
		} catch (e) {
			console.warn("Error counting Paper. Rethrowing error");
			console.log(e)
			throw e;
		}
	}

	/**
	 * getByTopic (and the other methods( are here because I need to return a collection of instances of this class
	 * */
	static async getByTopic(topic) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Paper)-[r:HAS_KEYWORD]->(t:Topic {name: {name}})
			RETURN n, [] as authors, [] as topics`, {name: topic});
			session.close();
			return res.records.map(record => new Paper({...Paper.toObject(record)}))
		} catch (e) {
			console.warn("Error getByTopic Paper. Rethrowing error");
			console.log(e)
			throw e;
		}
	}

	static async getByAuthor(author) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (a:Author {name:{name}})-[r:HAS_WRITTEN]->(n:Paper)
			RETURN n, [] as authors, [] as topics`, {name: author});
			session.close();
			return res.records.map(record => new Paper({...Paper.toObject(record)}))

		} catch (e) {
			console.warn("Error getByAuthor Paper. Rethrowing error");
			console.log(e)
			throw e;
		}
	}

	static async getByJournal(journal) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Paper)-[r:PUBLISHED_IN]->(b:Journal {name:{name}})
			RETURN n, [] as authors, [] as topics`, {name: journal});
			session.close();
			return res.records.map(record => new Paper({...Paper.toObject(record)}))
		} catch (e) {
			console.warn("Error getByAuthor Paper. Rethrowing error");
			console.log(e)
			throw e;
		}
	}
}
