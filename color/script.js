

var Mygame = {};
$( document ).ready(function() {
	Mygame.straigt = $('#straigt');
    Mygame.swapped = $('#swapped');
    Mygame.win = $('#win');
    Mygame.loose = $('#loose');
    Mygame.colorChoice = $('#colorChoice');
	Mygame.chosenColor = [];
	Mygame.score = 5;
	Mygame.lvl = 0;
	Mygame.combo = 0;
	function hideAll() {
		Mygame.straigt.hide();
		Mygame.swapped.hide();
		Mygame.win.hide();
		Mygame.loose.hide();
		Mygame.colorChoice.hide();
	}

	function showRandom() {
		if(Math.floor(Math.random()*2)) {
			Mygame.straigt.css('display', 'flex')
		} else {
			Mygame.swapped.css('display', 'flex')
		}
	}

	window.onpopstate = function(event) {
		hideAll();
		Mygame.colorChoice.css('display', 'grid')
	}

	$('.colorChoiceButton').click(function(e){
		// console.log(e.target.innerHTML);
		switch(e.target.innerHTML) {
			case "red":
				Mygame.chosenColor = [200,0,0];
				history.pushState({colour:"red"},"true","?color=red");
				break;
			case "blue":
				Mygame.chosenColor = [0,0,200];
				history.pushState({colour:"blue"},"true","?color=blue");
				break;
			case "green":
				Mygame.chosenColor = [0,200,0];
				history.pushState({colour:"green"},"true","?color=green");
				break;
			case "yellow":
				Mygame.chosenColor = [180,180,0];
				history.pushState({colour:"yellow"},"true","?color=yellow");
				break;
			case "gray":
				Mygame.chosenColor = [91,91,91];
				history.pushState({colour:"gray"},"true","?color=gray");
				break;
		}
		Setup();
		hideAll();
		showRandom();
	});
	function Setup() {
		$('.left').css('background', `rgb(${Mygame.chosenColor})`);
		$('.right').css('background', `rgb(${Mygame.chosenColor[0]+ (Mygame.lvl < 34 ? 30*(0.9**Mygame.lvl) : 0)},${Mygame.chosenColor[1]+ (Mygame.lvl < 36 ? 30*(0.9**Mygame.lvl) : 0)},${Mygame.chosenColor[2]+ 30*(0.9**Mygame.lvl)})`);
		// Mygame.loose.css('background', `rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)|0),a,a].join`,` })`)
		Mygame.win.css('background', `rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` })`)
	}
	$('.left').click(function(){
		hideAll();
		Mygame.win.css('display', 'flex');
		Mygame.combo++;
		Mygame.score+=Mygame.combo;
		if (Mygame.score > 10) {Mygame.score = 5; Mygame.lvl++;Setup()}
		console.log(Mygame.score, Mygame.lvl)
	});
	$('.right').click(function(){
		hideAll();
		Mygame.loose.css('display', 'flex')
		Mygame.combo = Mygame.combo < 0 ? Mygame.combo -1 : 0;
		Mygame.score += -2 + Mygame.combo;
		if (Mygame.score < 0) {Mygame.score = 5; Mygame.lvl --;Setup()}
		console.log(Mygame.score, Mygame.lvl)
	});
	$('.redo').click(function(){
		hideAll();
		showRandom();
	});
});