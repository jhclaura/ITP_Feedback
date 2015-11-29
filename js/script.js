var allData;

var courseN, teacherN, courseT, courseNum;
var studentsHolder;
var defaultEvals=[];

var el, evaluateList;
var name, pw;
var evalScores, evalScoreLists=[];


////////////////////////////////////////////////

init();
animate();

function init () {

	courseN = byId("course_name");
	teacherN = byId("teacher_name");
	courseT = byId("time_space");
	courseNum = byId("course_number");

	studentsHolder = byId("studentHolder");
	
	// get all the default eval scores of all the students
	evalScores = byClass("eval_scores");

	// VEX_DIALOG
		vex.defaultOptions.className = 'vex-theme-wireframe';
		// vex.dialog.alert("Good morning teacher Shiffman.");
		vex.dialog.open({
			message: "Enter your netId and password:",
			input: "<input name=\"netId\" type=\"text\" placeholder=\"netId\" required />\n<input name=\"password\" type=\"password\" placeholder=\"Password\" required />",
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
					vex.dialog.alert("See you next time.");
					return;
				}
				vex.dialog.alert("Good morning teacher " + data.netId + ".");
			}
		});

	// SORTABLE_DRAGGING
	// Eval at the top of the page
		el = document.getElementById('eval_items');

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

		byId('add_skill').onclick = function() {
			var s_el = document.createElement('li');			// for the TOP
			var s_el_simple = document.createElement('li');		// for every one

			vex.dialog.prompt({
				message: "Skill to add to evaluate:",
				placeholder: "Weirdness",
				callback: function(value){

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

		byId('update_skill').onclick = function() {

			// Alert to ask for confirmation before update and wipe out the records
			vex.dialog.confirm({
				message: 'This will reset the scaling history. Are you absolutely sure to do this?',
				callback: function(value) {
					console.log(value);
					if(!value) {
						return;
					}
					else{
						var currentEval = evaluateList.el.getElementsByTagName("li");
						// console.log(currentEval);
						// console.log(evaluateList.el.childNodes[1].innerHTML);

						for(var i=0; i<evalScores.length; i++){
							while (evalScores[i].firstChild) 
								evalScores[i].removeChild(evalScores[i].firstChild);
						}

						// For each evaluation element at TOP
						for(var i=0; i<currentEval.length; i++){

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
							$('.eval_scores').each(function(index){
								var $eLi = $("<li>").text(tmpCut[0]);
								$(this).append($eLi);
								var $eSpan = $("<span>",{
									class: "star-rating"
								}).appendTo($eLi);

								if(index!=0){	// if it's not Laura(fake) / from JSON
									for(var j=0; j<5; j++){
										$("<input>", {
											type: "radio",
											name: allData[index-1].firstname+tmpCut[0]+"Rating",
											value: j+1
										}).appendTo($eSpan);
									}
								} else {		// if it's Laura(fake)
									for(var j=0; j<5; j++){
										$("<input>", {
											type: "radio",
											name: "Laura Juo-Hsin"+tmpCut[0]+"Rating",
											value: j+1
										}).appendTo($eSpan);
									}
								}
							});
						}
					}
				}
			});	
		}

	// default Eval Elements
	var defaultEval = evaluateList.el.getElementsByTagName("li");

	for(var i=0; i<defaultEval.length; i++){
		var tmpL = defaultEval[i].innerHTML;
		var tmpCut = tmpL.split("<");
		defaultEvals.push(tmpCut[0]);
	}

	// read JSON
	$.getJSON("data/section.json", function(data){
		allData = data;
		console.log(data[0]);

		courseN.innerHTML += data[0].title;
		teacherN.innerHTML += data[0].title;
		courseT.innerHTML += (data[0].semester + " " + data[0].year);
		courseNum.innerHTML += data[0].course_number;

		$.each(data, function(key, val){
			// console.log(val.title);
			var studentRow = document.createElement('div');
			studentRow.className = "row";
			studentRow.id = val.firstname;

			var $sdiv_1 = $("<div/>", {
				class: "col-xs-6 col-lg-4"
			}).appendTo(studentRow);
			$("<h4></h4>").text(val.firstname + ", " + val.lastname).appendTo($sdiv_1);
			var $img = $("<img>", {
				//src: "images/dummy/"+key%15+".png",
				src: "https://itp.nyu.edu/image.php?image=/people_pics/itppics/" + val.netid + ".jpg",
				class: "img-responsive",
				//width: 300,
				height: 300
			}).appendTo($sdiv_1);

			var $sdiv_2 = $("<div/>", {
				class: "col-xs-12 col-sm-6 col-lg-8 eval_scores"
			}).appendTo(studentRow);
			for(var i=0; i<defaultEvals.length; i++){
				var $eLi = $("<li>").text(defaultEvals[i]).appendTo($sdiv_2);
				var $eSpan = $("<span>",{
					class: "star-rating"
				}).appendTo($eLi);
				for(var j=0; j<5; j++){
					$("<input>", {
						type: "radio",
						name: val.firstname+defaultEvals[i]+"Rating",
						value: j+1
					}).appendTo($eSpan);
				}
			}

			// text input
			// <div class="col-xs-12 col-sm-6 col-lg-8 eval_text">
			// 			<textarea id="LauraTextMiddle" placeholder="General feedback and opportunities."></textarea>
			// 		</div>
			var $sdiv_3 = $("<div/>", {
				class: "col-xs-12 col-sm-6 col-lg-8 eval_text"
			}).appendTo(studentRow);
			var $text = $("<textarea>",{
				id: val.firstname+"TextMiddle",
				placeholder: "General feedback and opportunities to " + val.firstname + ".",
				width: "80%",
				height: "5em"
			}).appendTo($sdiv_3);

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

function byId(_id) {
	return document.getElementById(_id);
}

function byClass(_class) {
	return document.getElementsByClassName(_class);
}