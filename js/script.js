var allData, allTeacherData;

var allTeachers = [], teacherStuff = {};
var ultimateSectionID;

var courseN, teacherN, courseT, courseNum;
var studentsHolder;
var defaultEvals=[];

var el, evaluateList;
var name, pw;
var evalScores, evalScoreLists=[];

var listToBeKeptPpl=[], listToBeKept=[];
var dataUrlObject={};

var readyToLaunch = false;

////////////////////////////////////////////////

superInit();
// animate();

function superInit() {
	$.getJSON("data/section2.json", function(data){
		allTeacherData = data;
		// console.log(data[0]);
		$.each(data, function(key, val){
			var _netid = val.netid;
			if( !teacherStuff[_netid] ){

				var classes = [];
				var classObj = {};
				classObj.section_id = val.section_id;
				classObj.name = val.title;
				classes.push(classObj);

				var detailObj = {};
				detailObj.firstname = val.firstname;
				detailObj.lastname = val.lastname;
				detailObj.classes = classes;

				teacherStuff[_netid] = detailObj;
			} else {
				var classObj = {};
				classObj.section_id = val.section_id;
				classObj.name = val.title;

				teacherStuff[_netid].classes.push(classObj);
			}
		});
	});

	// VEX_DIALOG
	// For instructors to LogIn (TO-DO)
		vex.defaultOptions.className = 'vex-theme-wireframe';
		doLoginDialog();

	byId('login').onclick = function() {
		if(readyToLaunch){
			vex.dialog.alert("You've already logged in!");
		} else {
			doLoginDialog();
		}
	}
}

function doLoginDialog() {
	vex.dialog.open({
		message: "Enter your netId and password:",
		input: "<input name=\"netId\" type=\"text\" placeholder=\"netId\" required />\n<input name=\"lastname\" type=\"password\" placeholder=\"Last Name\" required />",
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, {
				text: "Login"
			}),
			$.extend({}, vex.dialog.buttons.NO, {
				text: "Back"
			})
		],
		callback: function(data) {
			if(data===false){
				vex.dialog.alert("See you later!");
				return;
			}
			if (!teacherStuff[data.netId]) {
				vex.dialog.alert("Oops. Are you sure you are whom you think you are?");
				return;
			}
			if( teacherStuff[data.netId].lastname == data.lastname ){
				// v.0
				// vex.dialog.alert("Good morning teacher " + data.lastname + ".");
				// readyToLaunch = true;
				// //
				// init();

				// v.1
				// create input string!
				var stringForSelect="<select id='selectClass'>";
				for(var i=0; i<teacherStuff[data.netId].classes.length; i++){
					stringForSelect += "<option value='" + teacherStuff[data.netId].classes[i].section_id + "'>" + teacherStuff[data.netId].classes[i].name + "</option>";
				}
				stringForSelect += "</select>";

				vex.dialog.open({
					message: "Hi teacher " + data.lastname + ", which class do you want to give feedback on?",
					input: stringForSelect,
					buttons: [
						$.extend({}, vex.dialog.buttons.YES, {
							text: "OK"
						})
						// $.extend({}, vex.dialog.buttons.NO, {
						// 	text: "Back"
						// })
					],
					callback: function(dataaa) {
						if(dataaa===false){
							vex.dialog.alert("See you later!");
							return;
						}
						ultimateSectionID = $("#selectClass").val();
						readyToLaunch = true;
						//
						init();
					}
				});
			}else{
				vex.dialog.alert("Oops. Are you sure you are whom you think you are?");
				return;
			}
		}
	});
}

function init () {

	// Get html elements
		courseN = byId("course_name");
		teacherN = byId("teacher_name");
		courseT = byId("time_space");
		courseNum = byId("course_number");
		studentsHolder = byId("studentHolder");
		
		// get all the eval ranking of all the students
		evalScores = byClass("eval_scores");

	

	// SORTABLE_DRAGGING
	// The ranking things at the top of the page
		el = document.getElementById('eval_items');

		// Create Sortable object at the TOP
		evaluateList = Sortable.create(el, {
			animation: 150,
			filter: '.js-remove',
			onFilter: function(evt){
				evt.item.parentNode.removeChild(evt.item);
			}
			// onUpdate: function (evt){
			// 	var item = evt.item; // the current dragged HTMLElement
			// 	console.log(item);
			// }
		});

		// ADD button
		// Adding new element for ranking
		byId('add_skill').onclick = function() {
			var s_el = document.createElement('li');			// Get all the TOP elements
			var s_el_simple = document.createElement('li');		// Get all the students' elements

			vex.dialog.prompt({
				message: "Skill to add to evaluate:",
				placeholder: "Weirdness",
				callback: function(value){
					if(!value) {
						return;
					}
					s_el.className = value;
					s_el.innerHTML = value + '<i class="js-remove">X</i>';
					evaluateList.el.appendChild(s_el);
					//
					// s_el_simple.innerHTML = value;
					// for(var i=0; i<evalScores.length; i++){
					// 	evalScores[i].appendChild(s_el_simple);
					// }
				}
			});
			// s_el.innerHTML = 
		}

		// UPDATE button
		// If clicked, all the students' elements will be updated as same as the TOP one
		byId('update_skill').onclick = function() {

			// Alert to ask for confirmation before update, and wipe out the ranking history (if any)
			vex.dialog.confirm({
				message: 'This will reset the scaling history. Are you absolutely sure to do this?',
				callback: function(value) {
					// If No then do nothing
					if(!value) {
						return;
					}
					else{
						// Get the evaluation element object at the TOP
						var currentEval = evaluateList.el.getElementsByTagName("li");

						listToBeKeptPpl = [];
						// listToBeKept = [];

						// Detection for DELETE
						// - using all first student
						for(var k=0; k<evalScores.length; k++){

							listToBeKept = [];
							for(var i=0; i<evalScores[k].children.length; i++){
								var keepObj = {};
								keepObj['keep'] = false;
								keepObj['name'] = evalScores[k].children[i].className;
								keepObj['score'] = -1;
								listToBeKept.push(keepObj);

								for(var j=0; j<currentEval.length; j++){
									if( evalScores[k].children[i].className == currentEval[j].className ){
										listToBeKept[i].keep = true;
										listToBeKept[i].score = $("[name='"+allData[k].firstname+currentEval[j].className+"Rating']:checked").val();
										// console.log("keep li " + currentEval[j].className);
									}
								}
								// Delete the eval ranking of all the students
									// while (evalScores[i].firstChild) 
									// 	evalScores[i].removeChild(evalScores[i].firstChild);
							}
							listToBeKeptPpl.push(listToBeKept);
						}

						// Delete
						// v.0 -ALL
						for(var i=0; i<evalScores.length; i++){
							while (evalScores[i].firstChild) 
								evalScores[i].removeChild(evalScores[i].firstChild);
						}
						// v.1
						// for(var i=0; i<evalScores.length; i++){
						// 	for(var j=0; j<listToBeKept.length; j++){
						// 		if( !listToBeKept[j].keep ){
						// 			console.log("remove " + evalScores[i].children[j].className);
						// 			evalScores[i].removeChild(evalScores[i].children[j]);
						// 			listToBeKept.splice(j,1);
						// 		}
						// 	}
						// }
						// v.2
						// for(var j=0; j<listToBeKept.length; j++){
						// 	for(var i=0; i<evalScores.length; i++){
						// 		if( !listToBeKept[j].keep ){
						// 			console.log("remove " + evalScores[i].children[j].className);
						// 			evalScores[i].removeChild(evalScores[i].children[j]);
						// 		}
						// 	}
						// 	listToBeKept.splice(j,1);
						// }
						// v.3
						// for(var j=0; j<listToBeKept.length; j++){
						// 	// for(var i=0; i<evalScores.length; i++){
						// 		if( !listToBeKept[j].keep ){
						// 			console.log("remove " + listToBeKept[j].name);
						// 			var tmpCN = listToBeKept[j].name;
						// 			tmpCN = tmpCN.split(" ");
    		// 						if(tmpCN.length>1)
    		// 							$(".eval_scores").children("."+tmpCN[0]+"."+tmpCN[1]).remove();
    		// 						else
    		// 							$(".eval_scores").children("."+listToBeKept[j].name).remove();
						// 		}
						// }

						// For each evaluation element at TOP
						for(var i=0; i<currentEval.length; i++){
							var isCheckedAlready = false;
							var indexOfCheckedList = -1;

							// Get the checked Value!
							// for(var j=0; j<listToBeKept.length; j++){
							for(var j=0; j<listToBeKeptPpl[0].length; j++){
								if( (currentEval[i].className == listToBeKeptPpl[0][j].name)
									&& listToBeKeptPpl[0][j].keep ) {
									isCheckedAlready = true;
									indexOfCheckedList = j;
									console.log(currentEval[i].className + "is checked (first student): " + listToBeKeptPpl[0][j].score);
								}
							}

							// Get the text of the element, eg Fabrication
							var tmpL = currentEval[i].innerHTML;
							var tmpCut = tmpL.split("<");

							// For each student, recreate the evaluation element
							// v1
							// for(var j=0; j<evalScores.length; j++){
								// var s_el_simple = document.createElement('li');
								// s_el_simple.innerHTML = tmpCut[0];
								// evalScores[j].appendChild(s_el_simple);					
							// }

							// v2
							// var $eLi = $("<li>").text(tmpCut[0]).appendTo($('.eval_scores'));

							// var $eSpan = $("<span>",{
							// 	class: "star-rating"
							// }).appendTo($eLi);

							// for(var j=0; j<5; j++){
							// 	$("<input>", {
							// 		type: "radio",
							// 		name: tmpCut[0]+"Rating",
							// 		value: j+1
							// 	}).appendTo($eSpan);
							// }

							// v3
							// For every Div with className "eval_scores"
							// --> For every students' rankings
							$('.eval_scores').each(function(index){

								// Create li element, and assign text, eg Fabrication
								// Then append to the Div
								// v.1
								// var $eLi = $("<li>").text(tmpCut[0]);
								// v.2
								var $eLi = $("<li>", {
									text: tmpCut[0],
									class: tmpCut[0]
								});

								$(this).append($eLi);

								// Create span element, to restore all the ranking inputs
								// Then append to li
								var $eSpan = $("<span>",{
									class: "star-rating"
								}).appendTo($eLi);

								// console.log("index: " + index);

								// To create FIVE ranking dots for each element
								for(var j=0; j<5; j++){
									// Create input element
									// And assign specific name, eg Laura+Fabrication+Rating, so FIVE dots are in a group
									// v.1
									// $("<input>", {
									// 	type: "radio",
									// 	name: allData[index].firstname+tmpCut[0]+"Rating",
									// 	value: j+1
									// }).appendTo($eSpan);

									var $eLabel = $("<label>", {
										class: "radio-inline",
										text: j+1
									});

									if( isCheckedAlready && j==(listToBeKeptPpl[index][indexOfCheckedList].score-1) ){
										$("<input>", {
											type: "radio",
											name: allData[index].firstname+tmpCut[0]+"Rating",
											value: j+1,
											checked: "checked"
										}).appendTo($eLabel);

										$eLabel.appendTo($eSpan);
									} else {
										$("<input>", {
											type: "radio",
											name: allData[index].firstname+tmpCut[0]+"Rating",
											value: j+1
										}).appendTo($eLabel);
										$eLabel.appendTo($eSpan);
									}
								}
							});
						}
					}
				}
			});	
		}

	// Get all the default eval ranking elements, from the Sortable object at the TOP
	var defaultEval = evaluateList.el.getElementsByTagName("li");

	// Get all the names of the default eval ranking elements
	for(var i=0; i<defaultEval.length; i++){
		var tmpL = defaultEval[i].innerHTML;
		var tmpCut = tmpL.split("<");
		// tmpCut[0] = tmpCut[0].replace(/\s+/g, '');
		defaultEvals.push(tmpCut[0]);
	}

	// read JSON
	// v.1 from static file
	// v.2 from url (Dan O)
	var jsonURL = "https://itp.nyu.edu/registration/feedback/feedback.php?action=list_students&section_id=" + ultimateSectionID + "&secret_key=X7kdsjafoeTRD6DYY76TFDKU6T6HGGDFgd";
	// var jsonURL = "data/section.json";
	$.getJSON( jsonURL, function(data){
		allData = data;
		// console.log(data[0]);

		courseN.innerHTML += data[0].title;
		teacherN.innerHTML += data[0].title;
		courseT.innerHTML += (data[0].semester + " " + data[0].year);
		courseNum.innerHTML += data[0].course_number;

		// For each student
		$.each(data, function(key, val){

			// Create a div to contain everything of this student
			var studentRow = document.createElement('div');
			studentRow.className = "row";
			studentRow.id = val.firstname;

			// Create div for student name & image
			// As Grid by specific className to use in CSS
			// Then append to studentRow (Main div)
			var $sdiv_1 = $("<div/>", {
				class: "col-xs-6 col-lg-4"
			}).appendTo(studentRow);

			// Create h4 for showing the student name
			// Then append to sdiv_1 (Grid div)
			$("<h4></h4>").text(val.firstname + ", " + val.lastname).appendTo($sdiv_1);

			// Create img for showing the student image
			// Then append to sdiv_1 (Grid div)
			var $img = $("<img>", {
				src: "https://itp.nyu.edu/image.php?image=/people_pics/itppics/" + val.netid + ".jpg",
				class: "img-responsive",
				height: 300
			}).appendTo($sdiv_1);

			// Create div as Grid, by specific className to use in CSS
			// Then append to sdiv_1 (Grid div)
			var $sdiv_2 = $("<div/>", {
				class: "col-xs-12 col-sm-6 col-lg-8 eval_scores",
				id: val.netid + "RankingDiv"
			}).appendTo(studentRow);

			// For each eval element, create ranking dots
			for(var i=0; i<defaultEvals.length; i++){

				// Create li element, and assign text, eg Fabrication
				// Then append to the Div
				// v.1
				// var $eLi = $("<li>").text(defaultEvals[i]).appendTo($sdiv_2);
				// v.2
				var $eLi = $("<li>", {
					text: defaultEvals[i],
					class: defaultEvals[i]
				}).appendTo($sdiv_2);

				// Create span element, to restore all the ranking inputs
				// Then append to li
				// v.1
				var $eSpan = $("<span>",{
					class: "star-rating"
				}).appendTo($eLi);

				// v.2
				// var $eLabel = $("<label>", {
				// 	class: "radio-inline"
				// }).appendTo($eLi);

				// To create FIVE ranking dots for each element
				// Create input element
				// And assign specific name, eg Laura+Fabrication+Rating, so FIVE dots are in a group
				for(var j=0; j<5; j++){
					var $eLabel = $("<label>", {
						class: "radio-inline",
						text: j+1
					});

					$("<input>", {
						type: "radio",
						name: val.firstname+defaultEvals[i]+"Rating",
						value: j+1
					}).appendTo($eLabel);

					$eLabel.appendTo($eSpan);
				}
			}

			// Create div for text input
			// Then append to studentRow
			var $sdiv_3 = $("<div/>", {
				class: "col-xs-12 col-sm-6 col-lg-8 eval_text"
			}).appendTo(studentRow);

			// Create textarea element
			var $text = $("<textarea>",{
				id: val.netid+"TextMiddle",
				placeholder: "Put down some \"Opportunities\" to " + val.firstname + ".",
				// width: "80%",
				// height: "5em",
				class: "form-control",
				rows: "6"
			}).appendTo($sdiv_3);

			var $butnS = $("<button>",{
				id: val.firstname+"SaveButton",
				class: "btn btn-default btnSS",
				text: "Save",
				click:  function(){
					   		console.log("save data of " + val.firstname + "!");
					    }
			}).appendTo($sdiv_3);

			var $butnE = $("<button>",{
				id: val.netid+"EmailButton",
				class: "btn btn-default btnSS",
				text: "Send Email",
				click:  function(){
							//v.1
							// var mailto_link = "mailto:" + "linkinmonkey@gmail.com" + "?subject=Feedback on " + allData[0].title + "&body=" + $("#textStart").val();
							// // window.location.href = "mailto:linkinmonkey@gmail.com?subject=Feedback on " + allData[0].title;
							// // open new window
							// window.open(mailto_link,'emailWindow');

							//v.2
							// reference: http://email.about.com/library/misc/blmailto_encoder.htm
							var infoObj = {
								email: val.netid + "@nyu.edu",
								name: val.firstname,
								netid: val.netid,
								course: val.title
							};
							makeMailto( infoObj );
						}
			}).appendTo($sdiv_3);

			// Append studentRow (of each student), to studentsHolder (for all student)
			studentsHolder.appendChild(studentRow);
		});
	});
		
}

function animate() {
	requestAnimationFrame(animate);
	update();
}

function update() {

}

var strMailto, hasQ;
function addField(fieldName, formElement, encode) {
	if (formElement != "")
	{
		if (hasQ)
			strMailto += "&";
		else
		{
			strMailto += "?";
			hasQ = true;
		}
		strMailto += fieldName + "=";
		if (encode)
			strMailto += encodeURIComponent(formElement);
		else
			strMailto += formElement;
	}
}

function makeMailto( _infoObj ) {

	// SAVE IMAGE, using html2Canvas library
	// Ref: http://jsfiddle.net/AbdiasSoftware/7PRNN/
	var _id = _infoObj.netid;
	var whatToGrab = "#"+_id+"RankingDiv";
	/*
	html2canvas($(whatToGrab), {
		// $("#"+_infoObj.netid+"RankingDiv")
        onrendered: function(canvas) {
            // document.body.appendChild(canvas);

            var dataUrl = canvas.toDataURL("image/png");
            dataUrlObject[_id] = dataUrl;

		    var imageFoo = document.createElement('img');
			imageFoo.src = dataUrl;
			// document.body.appendChild(imageFoo);

			// Download IMG
			downloadURI(dataUrl, _infoObj.name + "Ranking" + _infoObj.course + ".png");
        }
    });
	*/

	// Compose Email!
	if ( $("#textStart").val() == "" || $("#textEnd").val() == "" || $("#"+_id+"TextMiddle").val() == "" )	{
		vex.dialog.confirm({
			message: 'Did you forget to put down what do you want to say to the student?',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: 'No I didn\'t.' 
				}),
				$.extend({}, vex.dialog.buttons.NO, {
					text: 'I forgot.'
				})
			],
			callback: function(value) {
				console.log(value);
				if(value==false)
					return;
				else{
					// Capture & Save image
					html2canvas($(whatToGrab), {
						// $("#"+_infoObj.netid+"RankingDiv")
				        onrendered: function(canvas) {
				            // document.body.appendChild(canvas);

				            var dataUrl = canvas.toDataURL("image/png");
				            dataUrlObject[_id] = dataUrl;

						    var imageFoo = document.createElement('img');
							imageFoo.src = dataUrl;
							// document.body.appendChild(imageFoo);

							// Download IMG
							downloadURI(dataUrl, _infoObj.name + "Ranking" + _infoObj.course + ".png");
				        }
				    });

				    // Compose Email
					strMailto = "mailto:";
					strMailto += _infoObj.email;
					hasQ = false;
					addField("subject", "Feedback on " + allData[0].title, true);
					var emailBody = "Hi "
									+ _infoObj.name
									+ ",\n\n"
									+ $("#textStart").val()
									+ "\n\n"
									+ "Here's your objective scores:\n"
									+ "(Replace this by inserting the \"" + _infoObj.name + "Ranking" + _infoObj.course + ".png\" image you just saved.)"
									+ "\n\n"
									+ $("#"+_id+"TextMiddle").val()
									+ "\n\n"
									+ $("#textEnd").val()
									+ "\n\nWarmest,\nLaura";

					addField("body", emailBody, true);

					setTimeout(function(){
						window.open(strMailto, 'emailWindow');
					},500);
				}
			}
		});
	}
}

function downloadURI(uri, name) {
	var link = document.createElement("a");
	link.download = name;
	link.href = uri;
	link.click();
}

function byId(_id) {
	return document.getElementById(_id);
}

function byClass(_class) {
	return document.getElementsByClassName(_class);
}