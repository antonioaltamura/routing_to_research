"use strict";
let config = $require('./config'),
	neo4j = require('neo4j-driver').v1,
	driver = neo4j.driver(config.bolt, neo4j.auth.basic(config.user, config.password)),
	λ = require('./../utils');

module.exports = class Topic {

	constructor({name, id = null}){
		this.id = id;
		this.name = name;
	}
	toString(){
		return `Topic: ${this.name}`;
	}
	async save(){
		const session = driver.session(neo4j.session.READ);
		try {
			//node update
			let q;
			if(this.id) {
				q = `MATCH (n:Topic) WHERE id(n) = toInteger(${this.id}) SET n.name = '${this.name}'`;
			}
			//node creation
			else {
				q = `MERGE (n:Topic {name: {name}}) RETURN n`;
			}
			console.log(q);
			let r = await session.run(q,{name:this.name});
			session.close();
			return r;
		} catch (e) {
			console.warn("Error in Topic model. Rethrowing error");
			throw e;
		}
	}
	static async delete(id) {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run(`MATCH (a:Topic) WHERE id(a) = toInteger({id}) DETACH DELETE a`, {id:id});
			session.close();
			return r;
		} catch (e) {
			console.warn("Error deleting Topic. Rethrowing error");
			console.log(e)
			throw e;
		}
	}
	static toObject(record) {
		return {
			id:λ.toInt(record.get("id")),
			name:record.get("name")
		}
	}
	static async getByNameContains(str) {
		try{	const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Topic) WHERE n.name =~ '(?i).*${str}.*' RETURN n.name AS name, id(n) AS id`);
			session.close();
			return res.records.map ( record => new Topic(Topic.toObject(record)))
		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			throw e;
		}
	}

	static async getByName(name) {
		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (a:Topic {name:{name}}}) RETURN DISTINCT n.name AS name, id(n) AS id`,{name:name});
			session.close();
			return res.records.map ( record => new Topic(Topic.toObject(record)))
		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			throw e;
		}
	}

	static async getById(id) {
		if (typeof id !== "number") throw "Check id type";

		try{
			const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Topic) WHERE id(n) = toInteger({id}) RETURN DISTINCT n.name AS name, id(n) AS id`, {id:id});
			session.close();
			return res.records.map ( record => new Topic(Topic.toObject(record)))[0]
		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			throw e;
		}
	}

	static async getAll(next) {
		try{	const session = driver.session(neo4j.session.READ);
			let res = await session.run(`MATCH (n:Topic) RETURN DISTINCT n.name AS name, id(n) AS id`);
			session.close();
			return res.records.map ( record => new Topic(Topic.toObject(record)))
		} catch (e) {
			console.warn("Error in Paper model. Rethrowing error");
			throw e;
		}
	}

	static async delete(id) {
		try {
			const session = driver.session(neo4j.session.READ);
			let r = await session.run("MATCH (a:Topic) WHERE id(a) = toInteger({id}) DETACH DELETE a", {id: id});
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
			let r = await session.run("MATCH (n:Topic) RETURN DISTINCT count(n) AS count");
			session.close();
			return λ.toInt(r.records[0].get("count"));
		} catch (e) {
			console.warn("Error counting Paper. Rethrowing error");
			console.log(e);
			throw e;
		}
	}
};