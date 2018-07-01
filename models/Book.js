let config = $require('./config'),
	neo4j = require('neo4j-driver').v1,
	driver = neo4j.driver(config.bolt, neo4j.auth.basic(config.user, config.password)),
	λ = require('./../utils');

module.exports = class Book {

	constructor({id, name, number="", isbn="", date="", file="", topics = [], authors = []}) {
		this.id = id;
		this.name = name;
		this.number = number;
		this.isbn = isbn;
		this.date = date;
		this.file = file;
		this.topics = topics;
		this.authors = authors;
	}

	toString() {
		return `Book: ${this.name}`;
	}
	async save() {
		const session = driver.session(neo4j.session.READ);
		try {
			let q;
			let params = {id: this.id, name: this.name, data: {}};
			if (this.number) params.data.number = this.number;
			if (this.isbn) params.data.isbn = this.isbn;
			if (this.date) params.data.date = this.date;
			if (this.file) params.data.file = this.file;
			params.authors = this.authors || [];
			params.topics = this.topics || [];

			//node update
			if(this.id) {
				q = `MATCH (n:Book) WHERE id(n) = toInteger({id})
				SET n.name = {name}
				SET n += {data}
				WITH n
				MATCH (_)-[r1:HAS_WRITTEN]->(n) DELETE r1
				WITH n
				MATCH (n)-[r2:HAS_KEYWORD]->(_) DELETE r2
				FOREACH(a IN {authors} |
				  MERGE (author:Author { name: a.name })
				  MERGE (author)-[:HAS_WRITTEN]->(n))
				FOREACH(t IN {topics} |
				  MERGE (topic:Topic { name: t.name })
				  MERGE (n)-[:HAS_KEYWORD]->(topic))`;
			}
			//node creation
			else {
				q = `MERGE (n:Book {name: {name}})
				SET n += {data}
				WITH n
				MATCH (_)-[r1:HAS_WRITTEN]->(n) DELETE r1
				WITH n
				MATCH (n)-[r2:HAS_KEYWORD]->(_) DELETE r2
				FOREACH(a IN {authors} |
				  MERGE (author:Author { name: a.name })
				  MERGE (author)-[:HAS_WRITTEN]->(n))
				FOREACH(t IN {topics} |
				  MERGE (topic:Topic { name: t.name })
				  MERGE (n)-[:HAS_KEYWORD]->(topic))
				RETURN n`;
			}

			console.log(q)
			let r = await session.run(q, params);
			session.close();
			return r;
		} catch (e) {
			console.warn("Error in Book model. Rethrowing error");
			console.warn(e);
			throw e;
		}
	}
	static toObject(record) {
		try {
			//TODO check whats happen if authors is empty
			return {
				id:λ.toInt(record.get('n').identity),
				...record.get('n').properties,
				authors: λ.formatNeo4jArray(record.get("authors")),
				topics: λ.formatNeo4jArray(record.get("topics"))
			}
		} catch (e) {
			console.log(e)
		}
	}
	static async getByNameContains(str) {
		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Book) WHERE n.name =~ {str} RETURN n, [] AS authors, [] as topics`, {str: `(?i).*${str}.*`});
			session.close();
			return res.records.map(record => new Book(Book.toObject(record)))
		} catch (e) {
			console.warn("Error in Book model. Rethrowing error");
			throw e;
		}
	}

	static async getByName(name) {
		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Book {name:{name}}}) RETURN n, [] AS authors, [] as topics`, {name: name});
			session.close();
			return res.records.map(record => new Book(Book.toObject(record)))
		} catch (e) {
			console.warn("Error in Book model. Rethrowing error");
			throw e;
		}
	}
	static async query(o) {
		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Book ${util.inspect(o)})
			OPTIONAL MATCH (a)-[:HAS_WRITTEN]->(n)
			OPTIONAL MATCH (n)-[:HAS_KEYWORD]->(k)
			RETURN n,
			collect(DISTINCT { name:a.name, id:id(a)}) AS authors,
			collect(DISTINCT { name:k.name, id:id(k)}) AS topics
			`);
			session.close();
			return res.records.map(record => new Book(Book.toObject(record)))
		} catch (e) {
			console.warn("Error in Book model. Rethrowing error");
			throw e;
		}
	}
	static async getById(id) {
		if (typeof id !== "number") throw "Check id type";

		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`
			MATCH (n:Book) WHERE id(n) = toInteger({id})
			OPTIONAL MATCH (a)-[:HAS_WRITTEN]->(n)
			OPTIONAL MATCH (n)-[:HAS_KEYWORD]->(k)
			RETURN n,
			collect(DISTINCT { name:a.name, id:id(a)}) AS authors,
			collect(DISTINCT { name:k.name, id:id(k)}) AS topics			
			`, {id: id})

			//old return
			//RETURN DISTINCT id(n) AS id, n.name AS name, n.number AS number, n.isbn AS isbn, n.date AS date,
			console.log(res.records[0]);
			session.close();
			return res.records.map(record => new Book(Book.toObject(record)))[0]
		} catch (e) {
			console.warn("Error in Book model. Rethrowing error");
			throw e;
		}
	}

	static async getAll(next) {
		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Book)
			RETURN n, [] AS authors, [] as topics`);
			session.close();
			return res.records.map(record => new Book(Book.toObject(record)))
		} catch (e) {
			console.warn("Error in Book model. Rethrowing error");
			console.warn(e)
			throw e;
		}
	}

	static async delete(id) {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run("MATCH (a:Book) WHERE id(a) = toInteger({id}) DETACH DELETE a", {id: id});
			session.close();
			return r;
		} catch (e) {
			console.warn("Error deleting Book. Rethrowing error");
			console.log(e)
			throw e;
		}
	}
	static async count() {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run("MATCH (n:Book) RETURN DISTINCT count(n) AS count");
			session.close();
			return λ.toInt(r.records[0].get("count"));
		} catch (e) {
			console.warn("Error counting Book. Rethrowing error");
			console.log(e)
			throw e;
		}
	}
	static async getByTopic(topic) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Book)-[r:HAS_KEYWORD]->(t:Topic {name: {name}})
				RETURN n, [] AS authors, [] as topics`, {name:topic});
			session.close();
			return res.records.map(record => new Book(Book.toObject(record)))

		} catch(e) {
			console.warn("Error getByTopic Book. Rethrowing error");
			console.log(e)
			throw e;
		}
	}
	static async getByAuthor(author) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (a:Author {name:{name}})-[r:HAS_WRITTEN]->(n:Book)
			RETURN n, [] AS authors, [] as topics`, {name:author});
			session.close();
			return res.records.map(record => new Book(Book.toObject(record)))
		} catch(e) {
			console.warn("Error getByAuthor Book. Rethrowing error");
			console.log(e)
			throw e;
		}
	}
};