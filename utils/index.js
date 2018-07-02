let neo4j = require('neo4j-driver').v1,
	path = require('path'),
	PDFImage = require("./pdf-image").PDFImage;


let utils = {
	/**
	 * just an experiment with Tagged Template Literals
	 * it builds the cypher query string handling optional fields
	 **/
	queryBuilder: (str, ...args) =>{
		let result = "";
		for(var i = 0; i < str.length - 1; i++) {
			result += str[i];
			if(args[i]){
				if(typeof args[i] === 'object' ){
					//console.log(args[i], Object.entries(args[i]))
					let [k,value] = Object.entries(args[i])[0];
					if(value) result += `${k} = '${value}'`;
				} else {
					result += args[i];
				}
			}
		}
		result += str[i];
		return result;
	},
	PDFtoPng: (filename) => {
		let p = path.join(__dirname, "..", "public","storage" , filename)
		console.log(p)
		var pdfImage = new PDFImage(p,{
			convertOptions: {
				"-resize": "500x500",
				"-quality": "75",
			 	"-background" :"white",
				"-alpha": "remove"
			}
		});
		return pdfImage.convertPage(0)
	},
    toInt : (n) => {
        var aSmallInteger = neo4j.int(n);
        if (neo4j.integer.inSafeRange(aSmallInteger)) {
            return aSmallInteger.toNumber();
        }
    },
	levenshtein: (a, b) => {
		if(a.length === 0) return b.length;
		if(b.length === 0) return a.length;

		[a,b] = [a.toLowerCase(), b.toLowerCase()]
		var matrix = [];

		// increment along the first column of each row
		var i;
		for(i = 0; i <= b.length; i++){
			matrix[i] = [i];
		}

		// increment each column in the first row
		var j;
		for(j = 0; j <= a.length; j++){
			matrix[0][j] = j;
		}

		// Fill in the rest of the matrix
		for(i = 1; i <= b.length; i++){
			for(j = 1; j <= a.length; j++){
				if(b.charAt(i-1) === a.charAt(j-1)){
					matrix[i][j] = matrix[i-1][j-1];
				} else {
					matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
						Math.min(matrix[i][j-1] + 1, // insertion
							matrix[i-1][j] + 1)); // deletion
				}
			}
		}

		return matrix[b.length][a.length];
	},
	formatNeo4jArray: (array) => {
		if(!array.length) return [];
    	let r = [];
		array.forEach((n) => {
			if(n.name && n.id) {
				r.push({
					name:n.name,
					id: utils.toInt(n.id)
				})
			}
		});
    	return r;
    },
	southPark: () => (`
*****************************************************************************
          _          __________                              _,
      _.-(_)._     ."          ".      .--""--.          _.-{__}-._
    .'________'.   | .--------. |    .'        '.      .:-'\`____\`'-:.
   [____________] /\` |________| \`\\  /   .'\`\`'.   \\    /_.-"\`_  _\`"-._\\
   /  / .\\/. \\  \\|  / / .\\/. \\ \\  ||  .'/.\\/.\\'.  |  /\`   / .\\/. \\   \`\\
   |  \\__/\\__/  |\\_/  \\__/\\__/  \\_/|  : |_/\\_| ;  |  |    \\__/\\__/    |
   \\            /  \\            /   \\ '.\\    /.' / .-\\                >/-.
   /'._  --  _.'\\  /'._  --  _.'\\   /'. \`'--'\` .'\\/   '._-.__--__.-_.'
 \\/_   \`""""\`   _\\/_   \`""""\`   _\\ /_  \`-./\\.-'  _\\'.    \`""""""""\`'\`\\
 (__/    '|    \\ _)_|           |_)_/            \\__)|        '        
   |_____'|_____|   \\__________/|;                  \`_________'________\`;-'
    '----------'    '----------'   '--------------'\`--------------------\`

*****************************************************************************
`)


};
module.exports = utils;







