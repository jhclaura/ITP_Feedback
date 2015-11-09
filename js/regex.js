var firstChar = /\S/;

function capitalize(s){
	return s.replace(firstChar, function(m){
		// console.log( m.toUpperCase() );
		return m.toUpperCase();
	});
}

var twoLine = /\n\n/g;
var oneLine = /\n/g;

function linebreak(s){
	return s.replace(twoLine, '<p></p>').replace(oneLine, '<br>');
}