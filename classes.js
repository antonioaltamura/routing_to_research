
class Author {

	constructor({id, name, birthdate, description, rank, department}) {
		this.id = id;
		this.name = name;
		this.birthdate = birthdate;
		this.description = description;
		this.rank = rank;
		this.department = department;
	}
}

class Book {

	constructor({id, name, number, isbn, date, file, topics = [], authors = []}) {
		this.id = id;
		this.name = name;
		this.number = number;
		this.isbn = isbn;
		this.date = date;
		this.topics = topics;
		this.file = file;
		this.authors = authors;
	}
}

class Journal {

	constructor({ name, papers=[], topics=[], notes, date, isbn, number, id }){
		this.id = id;
		this.name = name;
		this.isbn = isbn;
		this.date = date;
		this.number = number;
		this.notes = notes;
		this.papers = papers;
		this.topics = topics;
	}
}

class Paper {
	constructor({id, name, doi, date, file, abstract, notes, authors=[], topics=[]}){
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
}

class Topic {

	constructor({name, id = null}){
		this.id = id;
		this.name = name;
	}
}

let CreatePaper = `
CREATE (n:Paper {name: "Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?"})
SET n.doi = 'https://doi.org/10.1103/PhysRev.47.777'
SET n.date = '1935/03/25'
SET n.abstract = 'In a complete theory there is an element corresponding to each element of reality[...]'
SET n.notes = 'Most cited Einstein publication'
MERGE (a1:Author { name: 'A. Einstein' })
CREATE (a1)-[:HAS_WRITTEN]->(n)
MERGE (a2:Author { name: 'B. Podolsky' })
CREATE (a2)-[:HAS_WRITTEN]->(n)
MERGE (a3:Author { name: 'N. Rosen' })
CREATE (a3)-[:HAS_WRITTEN]->(n)
MERGE (b1}:Topic { name: 'quantum physics' })
CREATE (n)-[:HAS_KEYWORD]->(b1)
MERGE (b1}:Topic { name: 'Quantum entanglement' })
CREATE (n)-[:HAS_KEYWORD]->(b1)
`;


let p = new Paper({name:"paper",id:1,file:"boh.pdf"});