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
		this.topics = topics;
		this.file = file;
		this.authors = authors;
	}

	toString() {
		return `Book: ${this.name}`;
	}
	async save() {
		const session = driver.session(neo4j.session.READ);
		try {
			let q;
			//node update
			if(this.id) {
				q = `MATCH (n:Book) WHERE id(n) = toInteger(${this.id})
					SET n.name = '${this.name}'
					${this.number ? ` SET n.number = '${this.number}'` : ''}
					${this.isbn ? ` SET n.isbn = '${this.isbn}'` : ''}
					${this.date ? `SET n.date = '${this.date}'` : ''}
					${this.file ? `SET n.file = '${this.file}'` : ''}
					MERGE (y)-[r2:HAS_KEYWORD]->(n) DELETE r2
					MERGE (x)-[r1:HAS_WRITTEN]->(n) DELETE r1
					${this.authors.length ? this.authors.map((a,i) =>
						`MERGE (a${i}:Author { name: '${a.name}' })
						MERGE (a${i})-[:HAS_WRITTEN]->(n)`
						).join('\n') : ''}
					${this.topics.length ? this.topics.map((b,i) =>
					`MERGE (b${i}:Topic { name: '${b.name}' })
					MERGE (n)-[:HAS_KEYWORD]->(b${i})`
					).join('\n') : ''}	
					RETURN n`;
			}
			//node creation
			else {
				q = `MERGE (n:Book {name: {name}})
					${this.number ? ` SET n.number = '${this.number}'` : ''}
					${this.isbn ? ` SET n.isbn = '${this.isbn}'` : ''}
					${this.date ? `SET n.date = '${this.date}'` : ''}
					${this.file ? `SET n.file = '${this.file}'` : ''}
					${this.authors.length ? this.authors.map((a,i) =>
							`MERGE (a${i}:Author { name: '${a.name}' })
						MERGE (a${i})-[:HAS_WRITTEN]->(n)`
						).join('\n') : ''}
					${this.topics.length ? this.topics.map((b,i) =>
					`MERGE (b${i}:Topic { name: '${b.name}' })
					MERGE (n)-[:HAS_KEYWORD]->(b${i})`
					).join('\n') : ''}
					RETURN n`;
			}

			console.log(q)
			let r = await session.run(q, {name: this.name});
			session.close();
			return r;
		} catch (e) {
			console.warn("Error in Book model. Rethrowing error");
			console.warn(e);
			throw e;
		}
	}

	static toObject_old(record) {
		try {
			return {
				id: λ.toInt(record.get("id")),
				name: record.get("name"),
				number: record.get("number"),
				isbn: record.get("isbn"),
				date: record.get("date"),
				authors: λ.formatNeo4jArray(record.get("authors"))
				//authors: record.get("authors")
			}
		} catch (e) {
			console.log(e)
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
			//query param doesnt work in regexp
			let res = await session.run(`MATCH (n:Book) WHERE n.name =~ '(?i).*${str}.*' RETURN n, [] AS authors, [] as topics`);
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