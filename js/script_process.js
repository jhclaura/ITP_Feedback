function process(txt) {
	var tfidf = new TFIDF();

	tfidf.termFreq(txt);

	for(var i=0; i<files.length; i++){
		tfidf.docFreq(files[i].data);
	}

	tfidf.finish(files.length);
	tfidf.sortByScore();

	tfidfs.push(tfidf);

	var ks = tfidf.getKeys();
	// console.log(ks);
	var howmany = Math.min(10, ks.length);
	// console.log("howmany: " + howmany);

	for(var i=0; i<howmany; i++){
		var score = tfidf.getScore(ks[i]);
		// console.log("keys: " + ks[i] + ", score: " + score);
	}

	// showTFIDF(tfidf);
}

function showTFIDF (tfidf) {
	// clearList();
	var ks = tfidf.getKeys();
	var howmany = Math.min(10, ks.length);
	// console.log("ks.length " + ks.length);

	for(var i=0; i<howmany; i++){
		var score = tfidf.getScore(keys[i]);
		// console.log("keys: " + keys[i] + ", score: " + score);
	}
}

function processSent(txt) {
	var sents = txt.split(/\. */g);
	console.log("sents: " + sents[0]);
}

///////////////////////////////////////////////////

var dict, keys;

function countingStuff(txt){
	var tokens = txt.split(/\W+/);

	dict = {};	//object
	keys = [];	// array

	for(var i=0; i<tokens.length; i++){
		var word = tokens[i].toLowerCase();

		if(dict[word] == null){
			dict[word] = 1;
			keys.push(word);
		} else {
			dict[word] ++;
		}
	}

	keys.sort(comparison);

	function comparison(key1, key2){
		var count1 = dict[key1];
		var count2 = dict[key2];

		var diff = count2 - count1;
		return diff;
	}

	//result TOP 5
	for(var i=20; i<30; i++){
		var k = keys[i];
		console.log(k + ": " + dict[k] + " times");
	}
}