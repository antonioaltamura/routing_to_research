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



/*

		//Spanning Trees with Bounded Number of Branch Vertices
		var p = await Paper.query({id:1}); //TODO change id to node propriety!
		p[0].abstract = `We introduce the following combinatorial optimization problem: Given a connected graph G, find a spanning tree T of G with the smallest number of branch vertices (vertices of degree 3 or more in T). The problem is motivated by new technologies in the realm of optical networks. We investigate algorithmic and combinatorial aspects of the problem.`

		await p[0].save()

		//Discovering Small Target Sets in Social Networks: A Fast and Effective Algorithm
		p = await Paper.query({id:2});
		p[0].abstract = `Given a network represented by a graph  G=(V,E), we consider a dynamical process of influence diffusion in G that evolves as follows: Initially only the nodes of a given S subseteq V are influenced; subsequently, at each round, the set of influenced nodes is augmented by all the nodes in the network that have a sufficiently large number of already influenced neighbors. The question is to determine a small subset of nodes S (a target set) that can influence the whole network. This is a widely studied problem that abstracts many phenomena in the social, economic, biological, and physical sciences. It is known that the above optimization problem is hard to approximate within a factor of  2^{log ^{1-epsilon }|V|}, for any epsilon >0. In this paper, we present a fast and surprisingly simple algorithm that exhibits the following features: (1) when applied to trees, cycles, or complete graphs, it always produces an optimal solution (i.e, a minimum size target set); (2) when applied to arbitrary networks, it always produces a solution of cardinality which improves on previously known upper bounds; (3) when applied to real-life networks, it always produces solutions that substantially outperform the ones obtained by previously published algorithms (for which no proof of optimality or performance guarantee is known in any class of graphs).`
		await p[0].save()

		//Fostering transparency and participation in the data-based society
		p = await Paper.query({id:3});
		p[0].abstract = `This paper focuses on innovative solutions to the problem of transparency in Public Administrations (PAs) by opening up public data and services so that citizens participation is facilitated and encouraged. We introduce the motivating principles and the architectural solutions to a Social Platform for Open Data, that is designed in order to provide a sustainable and re-usable framework to provide collaborative and social access to Open Data provided by PAs. Our overall objective is to propose a engage citizens by making them able to socially interact over Open Data, by forming or joining existing online communities that share common interest and discuss common issues of relevance to local policy, service delivery, and regulation. The proposed architectural solution is supporting the citizens in a collective relationship among them (as a network helping each other) and with PAs so that the information provided by the Public Administrations is shared, interpreted, personalized, made easier to understand and discussed to assess its meanings. The results and benefits of our approach, as well as potential impact in the pilot experiences that are planned, are also discussed.`
		await p[0].save()

		//Agents Shaping Networks Shaping Agents: Integrating Social Network Analysis and Agent-Based Modeling
		p = await Paper.query({id:4});
		p[0].abstract = `The paper presents a recent development of an interdisciplinary research exploring innovative computational approaches to the scientific study of criminal behavior. The attention is focused on an attempt to combine social network analysis and agent-based modelling into CrimeMiner, an experimental framework that seamlessly integrates document-enhancement, visualization and network analysis techniques to support the study of criminal organizations. Our goal is both methodological and scientific. We are exploring how the synergy between ABM and SNA can support a deeper and more empirically grounded understanding of the complex dynamics taking place within criminal organizations between the individual/behavioral and social/structural level.`
		await p[0].save()

		//Symbol-relation grammars: a formalism for graphical languages
		p = await Paper.query({id:5});
		p[0].abstract = `A common approach to the formal description of pictorial and visual languages makes use of formal grammars and rewriting mechanisms. The present paper is concerned with the formalism of Symbol–Relation Grammars (SR grammars, for short). Each sentence in an SR language is composed of a set of symbol occurrences representing visual elementary objects, which are related through a set of binary relational items. The main feature of SR grammars is the uniform way they use context-free productions to rewrite symbol occurrences as well as relation items. The clearness and uniformity of the derivation process for SR grammars allow the extension of well-established techniques of syntactic and semantic analysis to the case of SR grammars. The paper provides an accurate analysis of the derivation mechanism and the expressive power of the SR formalism. This is necessary to fully exploit the capabilities of the model. The most meaningful features of SR grammars as well as their generative power are compared with those of well-known graph grammar families. In spite of their structural simplicity, variations of SR grammars have a generative power comparable with that of expressive classes of graph grammars, such as the edNCE and the N-edNCE classes.`
		await p[0].save()

		//Dissipation and spontaneous symmetry breaking in brain dynamics
		p = await Paper.query({id:6});
		p[0].abstract = `We compare the predictions of the dissipative quantum model of the brain with neurophysiological data collected from electroencephalograms resulting from high-density arrays fixed on the surfaces of primary sensory and limbic areas of trained rabbits and cats. Functional brain imaging in relation to behavior reveals the formation of coherent domains of synchronized neuronal oscillatory activity and phase transitions predicted by the dissipative model.`
		await p[0].save()

		//Phase transitions in the neuropercolation model of neural populations
		p = await Paper.query({id:7});
		p[0].abstract = `We model the dynamical behavior of the neuropil, the densely interconnected neural tissue in the cortex, using neuropercolation approach. Neuropercolation generalizes phase transitions modeled by percolation theory of random graphs, motivated by properties of neurons and neural populations. The generalization includes (1) a noisy component in the percolation rule, (2) a novel depression function in addition to the usual arousal function, (3) non-local interactions among nodes arranged on a multi-dimensional lattice. This paper investigates the role of non-local (axonal) connections in generating and modulating phase transitions of collective activity in the neuropil. We derived a relationship between critical values of the noise level and non-locality parameter to control the onset of phase transitions. Finally, we propose a potential interpretation of ontogenetic development of the neuropil maintaining a dynamical state at the edge of criticality.`
		await p[0].save()

		//Extremal graphs for weights
		p = await Paper.query({id:8});
		p[0].abstract = `Given a graph G = (V,E) and α ∈ R, we write wα(G)=∑xyϵEdG(x)αdG(y)α, and study the function wα(m) = max {wα(G): e(G) = m}. Answering a question from Bollobás and Erdös (Graphs of external weights, to appear), we determine wi(m) for every m, and we also give bounds for the case α ≠ 1.`
		await p[0].save()

		//On Weakly Prefix Subsemigroups
		p = await Paper.query({id:9});
		p[0].abstract = `A remarkable family of free subsemigroups of a free semigroup, the family of weakly prefix subsemigroups, is considered. An algorithm for obtaining the minimal weakly prefix subsemigroup containing a given finite subset is proposed.`
		await p[0].save()

		//Symbol-relation grammars: a formalism for graphical languages
		p = await Paper.query({id:10});
		p[0].abstract = `A common approach to the formal description of pictorial and visual languages makes use of formal grammars and rewriting mechanisms. The present paper is concerned with the formalism of Symbol–Relation Grammars (SR grammars, for short). Each sentence in an SR language is composed of a set of symbol occurrences representing visual elementary objects, which are related through a set of binary relational items. The main feature of SR grammars is the uniform way they use context-free productions to rewrite symbol occurrences as well as relation items. The clearness and uniformity of the derivation process for SR grammars allow the extension of well-established techniques of syntactic and semantic analysis to the case of SR grammars. The paper provides an accurate analysis of the derivation mechanism and the expressive power of the SR formalism. This is necessary to fully exploit the capabilities of the model. The most meaningful features of SR grammars as well as their generative power are compared with those of well-known graph grammar families. In spite of their structural simplicity, variations of SR grammars have a generative power comparable with that of expressive classes of graph grammars, such as the edNCE and the N-edNCE classes.`
		await p[0].save()

		//On the Construction of Statistically Synchronizable Codes
		p = await Paper.query({id:11});
		p[0].abstract = `The problem of constructing statistically synchronizable codes over arbitrary alphabets and for any finite source is considered. It is shown how to efficiently construct a statistically synchronizable code whose average codeword length is within the least likely codeword probability from that of the Huffman code for the same source. Moreover, a method is given for constructing codes having a synchronizing codeword. The method yields synchronous codes that exhibit high synchronizing capability and low redundancy.<>`
		await p[0].save()

		//On Weakly Prefix Subsemigroups
		p = await Paper.query({id:12});
		p[0].abstract = `We define a family of Distributed Hash Table systems whose aim is to combine the routing efficiency of randomized networks—e.g. optimal average path length O(log 2 n/δlog δ) with δ degree—with the programmability and startup efficiency of a uniform overlay—that is, a deterministic system in which the overlay network is transitive and greedy routing is optimal. It is known that Ω(log n) is a lower bound on the average path length for uniform overlays with O(log n) degree (Xu et al., IEEE J. Sel. Areas Commun. 22(1), 151–163, 2004).
Our work is inspired by neighbor-of-neighbor (NoN) routing, a recently introduced variation of greedy routing that allows us to achieve optimal average path length in randomized networks. The advantage of our proposal is that of allowing the NoN technique to be implemented without adding any overhead to the corresponding deterministic network.
We propose a family of networks parameterized with a positive integer c which measures the amount of randomness that is used. By varying the value c, the system goes from the deterministic case (c=1) to an “almost uniform” system. Increasing c to relatively low values allows for routing with asymptotically optimal average path length while retaining most of the advantages of a uniform system, such as easy programmability and quick bootstrap of the nodes entering the system.
We also provide a matching lower bound for the average path length of the routing schemes for any c.
`
		await p[0].save()*/



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