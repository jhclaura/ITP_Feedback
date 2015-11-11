var el, evaluateList;
var name, pw;
var evalScores, evalScoreLists=[];

////////////////////////////////////////////////

init();
animate();

function init () {
	
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
				}), $.extend({}, vex.dialog.buttons.NO, {
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
		el = document.getElementById('eval_items');
		evaluateList = Sortable.create(el, {
			animation: 150,
			filter: '.js-remove',
			onFilter: function(evt){
				evt.item.parentNode.removeChild(evt.item);
			}
		});

		byId('add_skill').onclick = function() {
			var s_el = document.createElement('li');
			var s_el_simple = document.createElement('li');
			vex.dialog.prompt({
				message: "Skill to add to evaluate:",
				placeholder: "Weirdness",
				callback: function(value){
					s_el.innerHTML = value + '<i class="js-remove">X</i>';
					evaluateList.el.appendChild(s_el);
					//
					s_el_simple.innerHTML = value;
					for(var i=0; i<evalScores.length; i++){
						evalScores[i].appendChild(s_el);
					}
				}
			});
			// s_el.innerHTML = 
		}

		// non-draggable
		for(var i=0; i<evalScores.length; i++){
			var evalScore = Sortable.create(evalScores[i], {
				animation: 0,
				disabled: true
			});
			evalScoreLists.push(evalScore);
		}
		
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