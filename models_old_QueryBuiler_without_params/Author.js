let config = $require('./config'),
	neo4j = require('neo4j-driver').v1,
	driver = neo4j.driver(config.bolt, neo4j.auth.basic(config.user, config.password)),
	λ = require('./../utils');



module.exports = class Author{

	constructor({id, name, birthdate, description, rank, department, nodeId}) {
		this.id = id;
		this.name = name;
		this.birthdate = birthdate;
		this.description = description;
		this.rank = rank;
		this.department = department;
	}

	toString() {
		return `Author: ${this.name} ${this.name}`;
	}

	async save() {
		const session = driver.session(neo4j.session.READ);
		try {
			let q;
			//node update
			if(this.id) {
				//experimental queryBuilder (not replicated in remaining classes)
				q = λ.queryBuilder`MATCH (n:Author) WHERE id(n) = toInteger(${this.id})
					${{"SET n.name": this.name}}
					${{"SET n.birthdate": this.birthdate}}
					${{"SET n.description": this.description}}
					${{"SET n.rank": this.rank}}
					${{"SET n.department": this.department}}`;

				console.log("q")
				console.log(q)
				/*q = `MATCH (n:Author) WHERE id(n) = toInteger(${this.id})
					SET n.name = '${this.name}'
					${this.birthdate ? ` SET n.birthdate = '${this.birthdate}'` : ''}
					${this.description ? ` SET n.description = '${this.description}'` : ''}
					${this.rank ? ` SET n.rank = '${this.rank}'` : ''}
					${this.department ? ` SET n.department = '${this.department}'` : ''}`;*/
			}
			//node creation
			else {
				q = λ.queryBuilder`MERGE (n:Author {name: {name}})
					${{"SET n.birthdate": this.birthdate}}
					${{"SET n.description": this.description}}
					${{"SET n.rank": this.rank}}
					${{"SET n.department": this.department}}`;
			}
			console.log(q);
			let r = await session.run(q, {name: this.name});
			session.close();
			return r;
		} catch (e) {
			console.warn("Error in Author model. Rethrowing error");
			console.warn(e)
			throw e;
		}
	}

	static toObject_old(record) {
		return {
			id: λ.toInt(record.get("id")),
			name: record.get("name"),
			birthdate: record.get("birthdate"),
			description: record.get("description")
		}
	}
	static toObject(record) {
		return {
			id:λ.toInt(record.get('n').identity),
			...record.get('n').properties
		}
	}

	static async getByNameContains(str) {
		try{
			const session = driver.session(neo4j.session.READ);
			//query param doesnt work in regexp
			let res = await session.run(`MATCH (n:Author) WHERE n.name =~ '(?i).*${str}.*' RETURN n`);
			session.close();
			return res.records.map(record => new Author(Author.toObject(record)))
		} catch (e) {
			console.warn("Error in Author model. Rethrowing error");
			console.log(e)
			throw e;
		}
	}

	static async getByName(name) {
		try{	const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (a:Author {name:{name}}}) RETURN DISTINCT n`, {name: name});
			session.close();
			return res.records.map(record => new Author(Author.toObject(record)))
		} catch (e) {
			console.warn("Error in Author model. Rethrowing error");
			throw e;
		}
	}

	static async getById(id) {
		if (typeof id !== "number") throw "Check id type";

		try{	const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Author) WHERE id(n) = toInteger({id}) RETURN n`, {id: id});
			session.close();
			return res.records.map(record => new Author(Author.toObject(record)))[0]
		} catch (e) {
			console.warn("Error in Author model. Rethrowing error");
			throw e;
		}
	}

	static async getAll(next) {
		try{	const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Author) RETURN DISTINCT n`);
			session.close();
			return res.records.map(record => new Author(Author.toObject(record)))
		} catch (e) {
			console.warn("Error in Author model. Rethrowing error");
			throw e;
		}
	}

	static async delete(id) {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run("MATCH (a:Author) WHERE id(a) = toInteger({id}) DETACH DELETE a", {id: id});
			session.close();
			return r;
		} catch (e) {
			console.warn("Error deleting Author. Rethrowing error");
			console.log(e)
			throw e;
		}
	}
	static async count() {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run("MATCH (n:Author) RETURN DISTINCT count(n) AS count");
			session.close();
			return λ.toInt(r.records[0].get("count"));
		} catch (e) {
			console.warn("Error counting Author. Rethrowing error");
			console.log(e)
			throw e;
		}
	}
};