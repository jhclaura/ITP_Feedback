var allData, allTeacherData;

var allTeachers = [], teacherStuff = {};
var ultimateSectionID;

var courseN, teacherN, courseT, courseNum;
var studentsHolder;
var defaultEvals=[];

var el, evaluateList;
var default_el = ["Fabrication", "Participation", "Concept developing", "Organizing", "Presentation"];
var el_menu, evaluateList_menu;
var name, pw;
var evalScores, evalScoreLists=[];
var rankingTexts = ["Needs Improvement", "Satisfactory", "Excellent", "N/A"];

var listToBeKeptPpl=[], listToBeKept=[];
var dataUrlObject={};

var readyToLaunch = false;

// DanO
var theSection_id, from_netid, to_netid;
var secret_key = "X7kdsjafoeTRD6DYY76TFDKU6T6HGGDFgd";
var server_address = "http://itp.nyu.edu/registration/feedback/feedback.php";
var server_address_menu = "http://itp.nyu.edu/registration/feedback/feedback_test.php";
//

////////////////////////////////////////////////

superInit();
// animate();

function superInit() {

	// Get all the data of teachers and their classes
	$.getJSON(server_address + "?action=list_sections&semester=Fall&year=2015&secret_key=" + secret_key, function(data){
		
		allTeacherData = data;
		// console.log(data[0]);

		$.each(data, function(key, val){
			// val --> Object
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

	byId('saveFake').onclick = function() {
		// if(readyToLaunch){
		// 	vex.dialog.alert("You've already logged in!");
		// } else {
		// 	doLoginDialog();
		// }

		vex.dialog.alert("All data are restored in server!");
	}
}

function doLoginDialog() {
	vex.dialog.open({
		message: "Enter your netId and last name:",
		input: "<input name=\"netId\" type=\"text\" placeholder=\"netId\" required />\n<input name=\"lastname\" type=\"password\" placeholder=\"Last Name\" required />",
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, {
				text: "Login"
			})
		],
		callback: function(data) {
			if(data===false){
				// vex.dialog.alert("See you later!");
				vex.dialog.open({
					message: "Please enter your netId and last name to proceed!",
					buttons: [
						$.extend({}, vex.dialog.buttons.YES, {
							text: "Ok"
						})
					],
					callback: function(data) {
						doLoginDialog();
					}
				});
				return;
			}
			if (!teacherStuff[data.netId]) {
				// vex.dialog.alert("Oops. Are you sure you are whom you think you are?");
				vex.dialog.open({
					message: "Oops. Are you sure you are whom you think you are?",
					buttons: [
						$.extend({}, vex.dialog.buttons.YES, {
							text: 'Retry' 
						})
					],
					callback: function(value) {
						doLoginDialog();
						return;
					}
				});				
			}
			else if( teacherStuff[data.netId].lastname == data.lastname ){
				from_netid = data.netId;

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
						theSection_id = ultimateSectionID;
						readyToLaunch = true;
						//
						init();
					}
				});
			}else{
				vex.dialog.alert("Oops. Are you sure you are whom you think you are?");
				doLoginDialog();
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

		el_menu = byId("eval_items_new");
		
		// get all the eval ranking of all the students
		evalScores = byClass("eval_scores");

	$("#all_textStart").change(changedStuff);
	$("#all_textEnd").change(changedStuff);

	// SORTABLE_DRAGGING
	// The ranking things at the top of the page
		// el = document.getElementById('eval_items');
		el = document.getElementById('eval_items_new');

		function list_menu() {
			return server_address_menu + "?action=get_feedback_menu&semester=Fall&year=2015&secret_key=" + secret_key + "&from_netid=fake_test&section_id=" + theSection_id;
		}

		$.getJSON( list_menu(), function(data){
			// allData = data;
			
			// console.log(data);
			// console.log(data.type_of_feedback);

			// v.1
			/*
			// if the menu is updated, use the record
			if(data.length>0){
				
				// For each student
				$.each(data, function(key, val){

					// var $e_m_Li = $("<li>", {
					// 	text: val.type_of_feedback,
					// 	class: val.type_of_feedback
					// });

					// var $e_m_i = $("<i>",{
					// 	text: "X",
					// 	class: "js-remove"
					// }).appendTo($e_m_Li);

					// $('#eval_items_new').append($e_m_Li);

					var e_m_Li = document.createElement('li');
					e_m_Li.className = val.type_of_feedback;
					e_m_Li.innerHTML = val.type_of_feedback + '<i class="js-remove">X</i>';

					$('#eval_items_new').append(e_m_Li);
				});

			// if the menu is not updated, use the default
			} else {

				for(var i=0; i<default_el.length; i++){

					var e_m_Li = document.createElement('li');
					e_m_Li.className = default_el[i];
					e_m_Li.innerHTML = default_el[i] + '<i class="js-remove">X</i>';

					$('#eval_items_new').append(e_m_Li);
				}
			}
			*/

			// v.2
			console.log(data.type_of_feedback.length);
			// if the menu is updated, use the record
			if(data.type_of_feedback.length>0){
				
				for(var i=0; i<data.type_of_feedback.length; i++){
					var e_m_Li = document.createElement('li');
					e_m_Li.className = data.type_of_feedback[i];
					e_m_Li.innerHTML = data.type_of_feedback[i] + '<i class="js-remove">X</i>';

					$('#eval_items_new').append(e_m_Li);
				}

			// if the menu is not updated, use the default
			} else {

				for(var i=0; i<default_el.length; i++){

					var e_m_Li = document.createElement('li');
					e_m_Li.className = default_el[i];
					e_m_Li.innerHTML = default_el[i] + '<i class="js-remove">X</i>';

					$('#eval_items_new').append(e_m_Li);
				}
			}


			// Create Sortable object at the TOP
			evaluateList = Sortable.create(el, {
				animation: 150,
				filter: '.js-remove',
				onFilter: function(evt){
					evt.item.parentNode.removeChild(evt.item);
				}
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
			}

			// UPDATE button
			// If clicked, all the students' elements will be updated as same as the TOP one
			byId('update_skill').onclick = function() {

				// Get the evaluation element object at the TOP
				var currentEval = evaluateList.el.getElementsByTagName("li");
				// console.log(currentEval[0].className);

				var newMenu = [];
				for(var i=0; i<currentEval.length; i++){
					newMenu.push(currentEval[i].className);
				}
				
				// POST to server
				// get existed radio feedback
				// var params = {
				// 	type_of_feedback: newMenu,
				// 	section_id: theSection_id,
				// 	from_netid: "fake_test"
				// };

				var params = {  
				   "type_of_feedback": newMenu,				   
				   "section_id":4085,
				   "from_netid":"fake_test"				   
				};
				
				//$.post(server_address_menu + "?action=update_feedback&secret_key=" + secret_key, params, savedMenuResponse, "json");
				
				$.post("http://itp.nyu.edu/registration/feedback/feedback_test.php?action=update_feedback&secret_key=X7kdsjafoeTRD6DYY76TFDKU6T6HGGDFgd", JSON.stringify(params), function(response){
					console.log("DONE!!");
				}, 'json');

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
				// - ALL
				for(var i=0; i<evalScores.length; i++){
					while (evalScores[i].firstChild) 
						evalScores[i].removeChild(evalScores[i].firstChild);
				}

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

						// To create Four ranking dots for each element
						for(var j=0; j<4; j++){
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
								text: rankingTexts[j]
							});

							// v.1
							// create input radio with client_side history
							// if( isCheckedAlready && j==(listToBeKeptPpl[index][indexOfCheckedList].score-1) ){
							// 	$("<input>", {
							// 		class: allData[index].netid + "_" + tmpCut[0],
							// 		type: "radio",
							// 		name: allData[index].firstname+tmpCut[0]+"Rating",
							// 		value: j+1,
							// 		checked: "checked"
							// 	}).change( changedStuffRadio ).appendTo($eLabel);

							// 	$eLabel.appendTo($eSpan);
							// } else {
							// 	$("<input>", {
							// 		class: allData[index].netid + "_" + tmpCut[0],
							// 		type: "radio",
							// 		name: allData[index].firstname+tmpCut[0]+"Rating",
							// 		value: j+1
							// 	}).change( changedStuffRadio ).appendTo($eLabel);
							// 	$eLabel.appendTo($eSpan);
							// }

							// v.2
							// create input radio with server_side history
							$("<input>", {
								class: allData[index].netid + "_" + tmpCut[0],
								type: "radio",
								name: allData[index].firstname+tmpCut[0]+"Rating",
								value: j
							}).change( changedStuffRadio ).appendTo($eLabel);
							$eLabel.appendTo($eSpan);
						}
					});
				}

				// get existed radio feedback
				var getParams = {
					action: 'get_feedback',
					section_id: theSection_id,
					secret_key: secret_key
				}
				$.post(server_address, getParams, gotExistingRadioFeedback, "json").done(function(data){
					console.log("DONE!");
				});
			}

			createStudentStuff();
		});
	
		

		/*
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
				// - ALL
				for(var i=0; i<evalScores.length; i++){
					while (evalScores[i].firstChild) 
						evalScores[i].removeChild(evalScores[i].firstChild);
				}

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

						// To create Four ranking dots for each element
						for(var j=0; j<4; j++){
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
								text: rankingTexts[j]
							});

							// v.1
							// create input radio with client_side history
							// if( isCheckedAlready && j==(listToBeKeptPpl[index][indexOfCheckedList].score-1) ){
							// 	$("<input>", {
							// 		class: allData[index].netid + "_" + tmpCut[0],
							// 		type: "radio",
							// 		name: allData[index].firstname+tmpCut[0]+"Rating",
							// 		value: j+1,
							// 		checked: "checked"
							// 	}).change( changedStuffRadio ).appendTo($eLabel);

							// 	$eLabel.appendTo($eSpan);
							// } else {
							// 	$("<input>", {
							// 		class: allData[index].netid + "_" + tmpCut[0],
							// 		type: "radio",
							// 		name: allData[index].firstname+tmpCut[0]+"Rating",
							// 		value: j+1
							// 	}).change( changedStuffRadio ).appendTo($eLabel);
							// 	$eLabel.appendTo($eSpan);
							// }

							// v.2
							// create input radio with server_side history
							$("<input>", {
								class: allData[index].netid + "_" + tmpCut[0],
								type: "radio",
								name: allData[index].firstname+tmpCut[0]+"Rating",
								value: j
							}).change( changedStuffRadio ).appendTo($eLabel);
							$eLabel.appendTo($eSpan);
						}
					});
				}

				// get existed radio feedback
				var getParams = {
					action: 'get_feedback',
					section_id: theSection_id,
					secret_key: secret_key
				}
				$.post(server_address, getParams, gotExistingRadioFeedback, "json");
			}
		*/

	// createStudentStuff();
}

function createStudentStuff() {
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
	//var jsonURL = "https://itp.nyu.edu/registration/feedback/feedback.php?action=list_students&section_id=" + ultimateSectionID + "&secret_key=X7kdsjafoeTRD6DYY76TFDKU6T6HGGDFgd";
	// var jsonURL = "data/section.json";

	function list_student() {
		return server_address + "?action=list_students&section_id=" + theSection_id + "&secret_key=" + secret_key;
	}

	$.getJSON( list_student(), function(data){
		allData = data;
		// console.log(data[0]);

		courseN.innerHTML += data[0].title;
		teacherN.innerHTML += teacherStuff[from_netid].firstname + " " + teacherStuff[from_netid].lastname;
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
				for(var j=0; j<4; j++){
					var $eLabel = $("<label>", {
						class: "radio-inline",
						text: rankingTexts[j]
					});

					$("<input>", {
						class: val.netid + "_" + defaultEvals[i],
						type: "radio",
						name: val.firstname+defaultEvals[i]+"Rating",
						value: j
					}).change( changedStuffRadio ).appendTo($eLabel);

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
				id: val.netid+"_TextMiddle",
				placeholder: "Put down your feedback to " + val.firstname + ".",
				// width: "80%",
				// height: "5em",
				class: "form-control",
				rows: "6"
			}).change(
				changedStuff
			).appendTo($sdiv_3);

			// var $butnS = $("<button>",{
			// 	id: val.firstname+"SaveButton",
			// 	class: "btn btn-default btnSS",
			// 	text: "Save",
			// 	click:  function(){
			// 		   		console.log("save data of " + val.firstname + "!");
			// 		    }
			// }).appendTo($sdiv_3);

			var $butnR = $("<button>",{
				id: val.firstname+"ReviewButton",
				class: "btn btn-default btnSS",
				text: "Review for email",
				click:  function(){

					// Get ranking elements!
				    var evalList = $('#eval_items').children();
				    var tempEvals = [];
				    for(var i=0; i<evalList.length; i++){
				    	var tempEvalObj = {};
				    	tempEvalObj.name = evalList[i].className;
				    	tempEvalObj.score = $("[name='"+val.firstname+tempEvalObj.name+"Rating']:checked").val();
				    	console.log(tempEvalObj.score);
				    	tempEvals.push(tempEvalObj);
				    }

					var emailBody = "Hi "
									+ val.firstname
									+ ",<br><br>"
									+ $("#all_textStart").val()
									+ "<br><br>"
									+ "Here's your objective scores:<br>";
					for(var i=0; i<tempEvals.length; i++){
						if(tempEvals[i].score!=3)
							emailBody += " * " + tempEvals[i].name + ": " + rankingTexts[tempEvals[i].score] + "<br>";
					}

					emailBody += "<br>"
								+ $("#"+val.id+"_TextMiddle").val()
								+ "<br><br>"
								+ $("#all_textEnd").val()
								+ "<br><br>Warmest,<br>"
								+ teacherStuff[from_netid].firstname + " " + teacherStuff[from_netid].lastname;

			   		vex.dialog.alert(
			   			emailBody
			   		);
			    }
			}).appendTo($sdiv_3);

			var $butnE = $("<button>",{
				id: val.netid+"EmailButton",
				class: "btn btn-default btnSS",
				text: "Send Email",
				click:  function(){
							console.log("click!");
							 $("#"+val.netid+"EmailButton").css("background-color","#7be6d4");
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

		// Get restored data!
		var getParams = {
			action: 'get_feedback',
			section_id: theSection_id,
			secret_key: secret_key
		}
		$.post(server_address, getParams, gotExistingFeedback, "json");
	});	
}

function gotExistingFeedback(existing_feedback) {

	for (var i = 0; i < existing_feedback.length; i++) {

		var id = existing_feedback[i].to_netid + "_" + existing_feedback[i].type_of_feedback;
		var element = $("#" + id);
		// console.log(element);

		if (element == null) {
			console.log("I am sorry but I am unfamiliar with that type of feedback");
		}
		else if(element.length>0) {
			var uncodingData = unescape(existing_feedback[i].feedback);
			element[0].value = uncodingData;
			// console.log("!");
		}
		else if(element.length==0){
			var classElement = $("." + id);

			// HACKING_WAY, since can't delete the old data for now
			// and existing_feedback[i].feedback might be bigger than 3
			if(classElement.length>0 && existing_feedback[i].feedback<4 ){
				// console.log(existing_feedback[i].to_netid + ", " + existing_feedback[i].feedback);
				classElement[ existing_feedback[i].feedback ].checked = "checked";
			}
			else {
				// className has Space
				var sepID = id.split(" ");
				var classNameWithSpace = "";
				for(var j=0; j<sepID.length; j++){
					classNameWithSpace += "." + sepID[j];
				}
				var classElement2 = $(classNameWithSpace);
				if(classElement2.length>0 && existing_feedback[i].feedback<4 ){
					// console.log(existing_feedback[i].to_netid + ", " + existing_feedback[i].feedback);
					classElement2[ existing_feedback[i].feedback ].checked = "checked";
				}
			}
		}
	}
}

function gotExistingRadioFeedback(existing_feedback) {
	for (var i=0; i<existing_feedback.length; i++) {
		var id = existing_feedback[i].to_netid + "_" + existing_feedback[i].type_of_feedback;
		var classElement = $("." + id);

		if(classElement.length>0)
			classElement[ existing_feedback[i].feedback ].checked = "checked";
		else {
			// className has Space
			var sepID = id.split(" ");
			var classNameWithSpace = "";
			for(var j=0; j<sepID.length; j++){
				classNameWithSpace += "." + sepID[j];
			}
			var classElement2 = $(classNameWithSpace);
			if(classElement2.length>0)
				classElement2[ existing_feedback[i].feedback ].checked = "checked";
		}

	}
}

function animate() {
	requestAnimationFrame(animate);
	update();
}

function update() {

}

// ref: DanO
function changedStuff() {
	//console.log(this);

	var parts = this.id.split("_")
	var my_json = [];
  	var thisGuy = {};
  	thisGuy.section_id = theSection_id;
	thisGuy.from_netid = from_netid;
	thisGuy.to_netid = parts[0];
	thisGuy.type_of_feedback = parts[1];
	thisGuy.feedback = escape( this.value );
	my_json.push(thisGuy);

	var params = {
		data: my_json,
		action: 'give_feedback',
		section_id: theSection_id,
		secret_key: secret_key
	}
	// console.log(params);

	// TEST Un_code
	// var test = unescape(thisGuy.feedback);
	// console.log( test );

	// Post to Server!!
	$.post(server_address, params, savedItResponse, "json");
}
// For radio input
function changedStuffRadio() {
	// console.log(this);

	var parts = this.className.split("_")
	// console.log(parts);
	var my_json = [];
  	var thisGuy = {};
  	thisGuy.section_id = theSection_id;
	thisGuy.from_netid = from_netid;
	thisGuy.to_netid = parts[0];
	thisGuy.type_of_feedback = parts[1];
	thisGuy.feedback = escape( this.value );
	my_json.push(thisGuy);
	var params = {
		data: my_json,
		action: 'give_feedback',
		section_id: theSection_id,
		secret_key: secret_key
	}

	// Post to Server!!
	$.post(server_address, params, savedItResponse, "json");
}

function savedItResponse(response) {
	// console.log(response);	
}

function savedMenuResponse(response) {
	console.log(response);
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
	if ( $("#all_textStart").val() == "" || $("#all_textEnd").val() == "" || $("#"+_id+"_TextMiddle").val() == "" )	{
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
				// console.log(value);
				if(value==false)
					return;
				else{
					makeTheEmail();
				}
			}
		});
	} else {
		makeTheEmail();
	}

	function makeTheEmail() {
		// Capture & Save image
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

	    // Get ranking elements!
	    var evalList = $('#eval_items').children();
	    var tempEvals = [], tempEvalObj = {};
	    for(var i=0; i<evalList.length; i++){
	    	tempEvalObj = {};
	    	tempEvalObj.name = evalList[i].className;
	    	tempEvalObj.score = $("[name='"+_infoObj.name+tempEvalObj.name+"Rating']:checked").val();
	    	console.log(tempEvalObj.score);
	    	tempEvals.push(tempEvalObj);
	    }

	    // Compose Email
		strMailto = "mailto:";
		strMailto += _infoObj.email;
		hasQ = false;
		addField("subject", "Feedback on " + allData[0].title, true);
		var emailBody = "Hi "
						+ _infoObj.name
						+ ",\n\n"
						+ $("#all_textStart").val()
						+ "\n\n"
						+ "Here's your objective scores:\n";
		for(var i=0; i<tempEvals.length; i++){
			if(tempEvals[i].score!=3)
				emailBody += " * " + tempEvals[i].name + ": " + rankingTexts[tempEvals[i].score] + "\n";
		}

		emailBody += "\n"
					+ $("#"+_id+"_TextMiddle").val()
					+ "\n\n"
					+ $("#all_textEnd").val()
					+ "\n\nWarmest,\n"
					+ teacherStuff[from_netid].firstname + " " + teacherStuff[from_netid].lastname;

		addField("body", emailBody, true);

		setTimeout(function(){
			window.open(strMailto, 'emailWindow');
		},500);
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