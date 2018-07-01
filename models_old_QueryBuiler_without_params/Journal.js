let config = $require('./config'),
	neo4j = require('neo4j-driver').v1,
	driver = neo4j.driver(config.bolt, neo4j.auth.basic(config.user, config.password)),
	λ = require('./../utils');


module.exports = class Journal {

	constructor({ name, papers=[], topics=[], notes = "", date="", isbn="", number ="", id = null }){
		this.id = id;
		this.name = name;
		this.isbn = isbn;
		this.date = date;
		this.number = number;
		this.notes = notes;
		this.papers = papers;
		this.topics = topics;
	}

	async save(){
		const session = driver.session(neo4j.session.READ);
		try {
			let q;
			//node update
			console.log(this.name)
			if(this.id) {
				q = `MATCH (n:Journal) WHERE id(n) = toInteger(${this.id})
					SET n.name = '${this.name}'
					${this.notes ? `SET n.notes = '${this.notes}'` : ''}
					${this.date ? `SET n.date = '${this.date}'` : ''}
					${this.number ? `SET n.number = '${this.number}'` : ''}
					${this.isbn ? `SET n.isbn = '${this.isbn}'` : ''}
   					MERGE (x)-[r1:PUBLISHED_IN]->(n) DELETE r1
					MERGE (y)-[r2:HAS_KEYWORD]->(n) DELETE r2
					${this.papers.length ? this.papers.map((a,i) =>
						`MERGE (a${i}:Paper { name: '${a.name}' })
					MERGE (a${i})-[:PUBLISHED_IN]->(n)`
					).join('\n') : ''}
					${this.topics.length ? this.topics.map((b,i) =>
						`MERGE (b${i}:Topic { name: '${b.name}' })
					MERGE (n)-[:HAS_KEYWORD]->(b${i})`
					).join('\n') : ''}`;
			}
			//node creation
			else {
				q = `MERGE (n:Journal { name: "${this.name}" })             
                ${this.notes ? `SET n.notes = '${this.notes}',` : ''}
                ${this.date ? `SET n.date = '${this.date}'` : ''}
                ${this.number ? `SET n.number = '${this.number}'` : ''}
                ${this.isbn ? `SET n.isbn = '${this.isbn}'` : ''}
   					MERGE (x)-[r1:PUBLISHED_IN]->(n) DELETE r1
					MERGE (y)-[r2:HAS_KEYWORD]->(n) DELETE r2
				${this.papers.length ? this.papers.map((a,i) =>
						`MERGE (a${i}:Paper { name: '${a.name}' })
				MERGE (a${i})-[:PUBLISHED_IN]->(n)`
					).join('\n') : ''}
				${this.topics.length ? this.topics.map((b,i) =>
						`MERGE (b${i}:Topic { name: '${b.name}' })
				MERGE (n)-[:HAS_KEYWORD]->(b${i})`
					).join('\n') : ''}`;
			}

			console.log(q);
			let r = await session.run(q, {name: this.name});
			session.close();
			return r;
		} catch (e) {
			console.warn("Error in Journal model. Rethrowing error");
			console.warn(e)
			throw e;
		}
	}
	static toObject_old (record) {
		return {
			id: λ.toInt(record.get("id")),
			name: record.get("name"),
			date: record.get("date"),
			isbn: record.get("isbn"),
			number: record.get("number"),
			papers: λ.formatNeo4jArray(record.get("papers")),
			topics: λ.formatNeo4jArray(record.get("topics"))
		}
	}
	static toObject(record) {
		try {
			return {
				id:λ.toInt(record.get('n').identity),
				...record.get('n').properties,
				papers: λ.formatNeo4jArray(record.get("papers")),
				topics: λ.formatNeo4jArray(record.get("topics"))
			}
		} catch (e) {
			console.log(e)
		}
	}
	static async getByNameContains(str) {
		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Journal) WHERE n.name =~ '(?i).*${str}.*'
			RETURN n, [] AS papers, [] as topics`);
			session.close();
			return res.records.map ( record => new Journal({...Journal.toObject(record)}))
		} catch (e) {
			console.warn("Error in Journal model. Rethrowing error");
			throw e;
		}
	}

	static async getByName(name) {
		try{	const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Journal {name:{name}}})
			RETURN n, [] AS papers, [] as topics`,{name:name});
			session.close();
			return res.records.map ( record => new Journal({...Journal.toObject(record)}))
		} catch (e) {
			console.warn("Error in Journal model. Rethrowing error");
			throw e;
		}
	}

	static async getById(id) {
		if (typeof id !== "number") throw "Check id type";

		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Journal) WHERE id(n) = toInteger({id})
						OPTIONAL MATCH (a:Paper)-[:PUBLISHED_IN]->(n)
						OPTIONAL MATCH (n)-[:HAS_KEYWORD]->(b:Topic)
						RETURN n,
						collect(DISTINCT { name:a.name, id:id(a)}) AS papers,
						collect(DISTINCT { name:b.name, id:id(a)}) AS topics
			`, {id:id});
			session.close();
			return res.records.map ( record => new Journal({...Journal.toObject(record)}))[0]
		} catch (e) {
			console.warn("Error in Journal model. Rethrowing error");
			console.warn(e)
			throw e;
		}
	}

	static async getAll(next) {
		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Journal)
			RETURN n, [] AS papers, [] as topics`);
			session.close();
			return res.records.map ( record => new Journal({...Journal.toObject(record)}))
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


