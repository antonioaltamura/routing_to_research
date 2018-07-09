/**
 * Created by Antonio Altamura on 03/06/2018.
 */
let config = $require('./config'),
	neo4j = require('neo4j-driver').v1,
	driver = neo4j.driver(config.bolt, neo4j.auth.basic(config.user, config.password)),
	λ = require('./../utils');


module.exports = class Author {

	constructor({id, name, birthdate, description, rank, department}) {
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
			let params = {id: this.id, name: this.name, data: {}};
			if (this.birthdate) params.data.birthdate = this.birthdate;
			if (this.description) params.data.description = this.description;
			if (this.rank) params.data.rank = this.rank;
			if (this.department) params.data.department = this.department;

			//node update
			if (this.id) {
				q = `MATCH (n:Author) WHERE id(n) = toInteger({id})
				SET n.name = {name}
				SET n += {data}`;
			}
			//node creation
			else {
				q = `MERGE (n:Author {name: {name}})
				SET n += {data}`;
			}
			console.log(q);
			let r = await session.run(q, params);
			session.close();
			return r;
		} catch (e) {
			console.warn("Error in Author model. Rethrowing error");
			console.warn(e)
			throw e;
		}
	}

	static toObject(record) {
		return {
			id: λ.toInt(record.get('n').identity),
			...record.get('n').properties
		}
	}

	static async getByNameContains(str) {
		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Author) WHERE n.name =~ {str} RETURN n`, {str: `(?i).*${str}.*`});
			session.close();
			return res.records.map(record => new Author(Author.toObject(record)))
		} catch (e) {
			console.warn("Error in Author model. Rethrowing error");
			console.log(e)
			throw e;
		}
	}

	static async getByName(name) {
		try {
			const session = driver.session(neo4j.session.READ);
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

		try {
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Author) WHERE id(n) = toInteger({id}) RETURN n`, {id: id});
			session.close();
			return res.records.map(record => new Author(Author.toObject(record)))[0]
		} catch (e) {
			console.warn("Error in Author model. Rethrowing error");
			throw e;
		}
	}

	static async getAll() {
		try {
			const session = driver.session(neo4j.session.READ);
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