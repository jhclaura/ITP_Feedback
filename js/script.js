var final_script = '', interim_transcript = '';
var start_timestamp;
var recog_timestamp, time;
var recognizing = false;
var recognition;
var theButton, theSButton;
var pauseCount = 0, pauseTime = 900;
var tmpString1 = '', tmpString2 = '';
var firstHappened = false, firstHappened2 = false;

var forExaminate = [], resultHolder = [];

//name,secret,pw
var theName, theSecret, thePW;
var gotAllInfo = false, secretStatusChanged = false;
var theSecret_preValue;

//
var dropZone;

//
var tfidfs = [];
var files = [];

//
var wordsSents = [];

function init() {

	theButton = document.getElementById("start_button");
	theSButton = document.getElementById("submit_button");
	theName = document.getElementById("name");
	theSecret = document.getElementById("secret");
		theSecret_preValue = theSecret.value;
	// thePW = document.getElementById("password");

	// FILE_READING
	dropZone = document.getElementById("drop_zone");
	dropZone.addEventListener("dragenter", dragenter, false);
	dropZone.addEventListener("dragover", dragover, false);
	dropZone.addEventListener("dragleave", dragleave, false);
	dropZone.addEventListener("drop", drop, false);

	// FILE_LOADING
	// dropZone.dragOver(highlight);
	// dropZone.drop(gotFile, unHighlight);

	animate();			
}

function animate() {
	requestAnimationFrame(animate);
	update();
}

function update() {

	// INFO_FILLING
	if(theSecret_preValue != theSecret.value){

		if(theSecret.value == "yes"){
			var div = document.getElementsByClassName("inputHolder")[0];
			thePW = document.createElement("textarea");
			thePW.id = "password";
			thePW.placeholder = "since it's a secret, set a password for it."
			div.appendChild(thePW);
			theSButton.parentNode.insertBefore(thePW, theSButton);

			theSecret_preValue = theSecret.value;
		}

		if(theSecret.value == "no"){
			if(thePW)
				thePW.parentNode.removeChild(thePW);

			theSecret_preValue = theSecret.value;
		}

	}


	// SPEECH_API
	if( recognizing && (time - recog_timestamp>pauseTime) ) {
		pauseCount++;
		// console.log("pause: " + pauseCount);

		// in the beginning
		// assign final_script to my_span
			if(final_script!='' && !firstHappened) {
				my_span.innerText = final_script;
				my_span.innerText += '\n';
				firstHappened = true;
				// console.log("only once!");

				var msg = {
					'type': 'toExamine',
					'text': final_script
				};

				if(ws){
					sendMessage( JSON.stringify(msg) );
					console.log("send msg to server!");
				}
			}

		// change line!
			tmpString1 = my_span.innerText.replace( /\r\n|\r|\n/gm, " ");	// remove line break
			// tmpString1 = my_span.innerHTML.replace( /<br\s*[\/]?>/gm, "");	// remove line break
			tmpString1 = tmpString1.replace( /^\s*|\s*$/g, "");		// remove white space

			// console.log("my_span.innerText.replace result:" + tmpString1 + ".");
			// console.log("current final_script:" + final_script + ".");

			// if(firstHappened && !firstHappened2){
			// 	tmpString1 += " ";
			// 	firstHappened2 = true;
			// }
			
			// if(tmpString1==final_script) console.log("same!");

			tmpString2 = final_script.replace( tmpString1, "");
			tmpString2 = tmpString2.replace( /^\s*|\s*$/g, "");

			if(tmpString2!=""){
				// my_span.innerHTML += " ";
				// console.log("add tmpString2:" + tmpString2 + ".");
				forExaminate.push( tmpString2 );

				// send to server
					var msg = {
						'type': 'toExamine',
						'text': tmpString2
					};

					if(ws){
						sendMessage( JSON.stringify(msg) );
						console.log("send msg to server!");
					}

				var lChar = my_span.innerText.match(/.$/);
				// my_span.innerText = my_span.innerText.replace( /.$/, lChar + " " + tmpString2);
				my_span.innerText += tmpString2;
				my_span.innerText += '\n';

				// console.log("new input!");
				// console.log("my_span.innerText result:" + my_span.innerText + ".");
			}
		recog_timestamp = Date.now();
	}

	time = Date.now();

}

function submitButton(event){
	if(theName.value!="") {
		if( theSecret.value=="no" || (theSecret.value=="yes" && thePW.value!="") )
			gotAllInfo = true;
	}
	else {
		// you didn't fill in the info
		console.log("you have to fill in information!");
	}

	if(gotAllInfo){
		// send to database!
		console.log("send to database");
	}
}

function startButton(event){
	// if is recognizing, stop it
	if(recognizing){
		console.log("final_script: " + final_script);
		recognition.stop();
		theButton.textContent = "start";
		return;
	}

	// start / restart
	if(gotAllInfo){
		final_script = "";
		recognition.start();
		theButton.textContent = "stop";

		start_timestamp = event.timeStamp;
		recog_timestamp = event.timeStamp;
		time = Date.now();
	}
}

function useSample(event){

	var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "/sources/hhgttg.txt", true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                // console.log(allText);
                // var words = RiTa.tokenize(allText);
                countingStuff(allText);
            }
        }
    }
    rawFile.send(null);
}

function useSamples(event){
	var filenames = [];
	for(var i=0; i<35; i++){
		var n1 = "/sources/hhgttg_ch";
		var nn = i+1;
		var n2 = ".txt";
		filenames.push(n1+nn+n2);
	}

	for(var i=0; i<filenames.length; i++){
		loadFiles(filenames[i]);
	}

	console.log("files.length: " + files.length);

	setTimeout(function() {
		console.log("start the process!");

		for(var i=0; i<files.length; i++){
			process(files[i].data);

			if(i==0)
				processSent(files[i].data);
		}
	}, 3000);
}

function loadFiles(filename) {
	var rawFile = new XMLHttpRequest();
    rawFile.open("GET", filename, true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;

                var fileObj = {
                	name: filename,
                	data: allText
                };
                // console.log(fileObj.name);

                files.push(fileObj);
                // process(fileObj.data);
            }
        }
    }
    rawFile.send(null);
}

function dragenter(e){
	e.stopPropagation();
	e.preventDefault();
}

function dragover(e){
	e.stopPropagation();
	e.preventDefault();

	dropZone.style.backgroundColor = 'yellow';
}

function dragleave(e){
	e.stopPropagation();
	e.preventDefault();

	dropZone.style.backgroundColor = '';
}

function drop(e){
	e.stopPropagation();
	e.preventDefault();

	var dt = e.dataTransfer;
	var files = dt.files;

	handleFiles(files);
	dragleave(e);
}

function handleFiles(files){

	var numFiles = files.length;
	console.log("got " + numFiles + " files!");

	for(var i=0; i<numFiles; i++){
		ParseFile(files[i]);
	}
}

function ParseFile(file){
	console.log(file);
	console.log("file name: " + file.name);
	console.log("file type: " + file.type);
	console.log("file size: " + file.size + " bytes");

	if(file.type.indexOf("text")==0){

		var reader = new FileReader();
		reader.onload = function(e){
			var text = e.target.result;
			console.log(text);
		}
		reader.readAsText(file);
	}
}

//////////////////////////////////////////////////////
function WordsSent() {
	this.dict = {};		// sentences
	this.keys = [];		// word
}
