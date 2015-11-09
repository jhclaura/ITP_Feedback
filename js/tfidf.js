// Daniel Shiffman
// Programming from A to Z, Fall 2014
// https://github.com/shiffman/Programming-from-A-to-Z-F14

function TFIDF() {
	this.dict = {};
	this.keys = [];
	this.totalwords = 0;

	function split(text) {
		return text.split(/\W+/);
	}

	function validate(token) {
		return /\w{2,}/.test(token);
	}

	this.termFreq = function(data) {
		var tokens = split(data);
		// console.log(tokens);

		for(var i=0; i<tokens.length; i++){
			var token = tokens[i].toLowerCase();

			if(validate(token)){
				// this.increment(token[i]);

				if(this.dict[token] == undefined){
					this.dict[token] = {};
					this.dict[token].count = 1;
					this.dict[token].docCount = 0;
					this.dict[token].word = token;
					this.keys.push(token);
				} else {
					this.dict[token].count ++;
				}

				this.totalwords ++;
			}	
		}
		// console.log(this.totalwords);
	}

	this.docFreq = function(data) {
		var tokens = split(data);

		var tempDict = {};

		for(var i=0; i<tokens.length; i++){
			var token = tokens[i].toLowerCase();

			if(validate(token) && tempDict[token]==undefined) {
				tempDict[token] = true;
			}
		}

		for(var i=0; i<this.keys.length; i++){
			var k = this.keys[i];
			if(tempDict[k]){
				this.dict[k].docCount ++;
			}
		}
	}


	// Get all the keys
	this.getKeys = function() {
		return this.keys;
	}

	// Get the count for one word
	this.getCount = function(word) {
		return this.dict[word].count;
	}

	// Get the score for one word
	this.getScore = function(word) {
		return this.dict[word].tfidf;
	}


	this.finish = function(totaldocsCount) {
		for(var i=0; i<this.keys.length; i++){
			var key = this.keys[i];
			var word = this.dict[key];

			var tf = word.count / this.totalwords;
			var idf = Math.log(totaldocsCount / word.docCount);

			word.tfidf = tf * idf;
		}
	}

	// Sort by word counts
	this.sortByCount = function() {
		// A fancy way to sort each element
		// Compare the counts
		var tfidf = this;
		this.keys.sort(function(a,b) {
			return (tfidf.getCount(b) - tfidf.getCount(a));
		});
	}

	// Sort by TFIDF score
	this.sortByScore = function() {
		// A fancy way to sort each element
		// Compare the counts
		var tfidf = this;
		this.keys.sort(function(a,b) {
			return (tfidf.getScore(b) - tfidf.getScore(a));
		});
	}
}






