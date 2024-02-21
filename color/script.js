

var Mygame = {};
$( document ).ready(function() {
	Mygame.straigt = $('#straigt');
    Mygame.swapped = $('#swapped');
    Mygame.win = $('#win');
    Mygame.loose = $('#loose');
    Mygame.colorChoice = $('#colorChoice');
    Mygame.scorePanel = $('#score');
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
		Mygame.scorePanel.hide();
	}

	function showRandom() {
		if(Math.floor(Math.random()*2)) {
			Mygame.straigt.css('display', 'flex')
		} else {
			Mygame.swapped.css('display', 'flex')
		}
		Mygame.scorePanel.css('display', 'flex');
		Mygame.scorePanel.html(`<p>LVL ${Mygame.lvl}</p>
			<p>score ${Mygame.score} /10</p>
			<p>combo ${Mygame.combo}</p>
			${Mygame.lvl > 25 ? `difference: ${Mygame.difference}`: ""}`);
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
		
		if (Mygame.lvl < 42) {
			setWrongColorForLvl(Mygame.lvl);
			$('.right').css("border", `none`);
			$('.left').css("border", `none`);
		}
		else if (Mygame.lvl < 55) {
			setWrongColorForLvl(Mygame.lvl - 13);
			$('.right').css("border", `solid 1px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			$('.left').css("border", `solid 1px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
		}
		else if (Mygame.lvl < 68) {
			setWrongColorForLvl(Mygame.lvl - 26);
			$('.right').css("border", `solid 10px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			$('.left').css("border", `solid 10px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
		}
		else if (Mygame.lvl < 81) {
			setWrongColorForLvl(Mygame.lvl - 39);
			$('.right').css("border", `solid 50px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			$('.left').css("border", `solid 50px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
		}
		else {
		}
		// Mygame.loose.css('background', `rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)|0),a,a].join`,` })`)
	}
	function setWrongColorForLvl(lvl)
	{
		if (lvl < 34) {
			$('.right').css('background', `rgb(${Mygame.chosenColor[0]+ 30*(0.9**lvl)},${Mygame.chosenColor[1]+ 30*(0.9**lvl)},${Mygame.chosenColor[2]+ 30*(0.9**lvl)})`);
			Mygame.difference = Math.round(30*(0.9**lvl))*3;
			Mygame.win.css('background', `color-mix(in oklab, ${`rgb(${Mygame.chosenColor[0]+ 30*(0.9**lvl)},${Mygame.chosenColor[1]+ 30*(0.9**lvl)},${Mygame.chosenColor[2]+ 30*(0.9**lvl)})`}, ${`rgb(${Mygame.chosenColor})`}`)
		} else if (lvl < 36) {
			$('.right').css('background', `rgb(${Mygame.chosenColor[0]},${Mygame.chosenColor[1]+ 1},${Mygame.chosenColor[2] + 1})`);
			Mygame.difference = 2;
			Mygame.win.css('background', `color-mix(in oklab, ${`rgb(${Mygame.chosenColor[0]},${Mygame.chosenColor[1]+ 1},${Mygame.chosenColor[2] + 1})`}, ${`rgb(${Mygame.chosenColor})`}`)
		} else if (lvl < 38) {
			$('.right').css('background', `rgb(${Mygame.chosenColor[0]},${Mygame.chosenColor[1]+ 1},${Mygame.chosenColor[2]})`);
			Mygame.difference = 1 + " (Green)";
			Mygame.win.css('background', `color-mix(in oklab, ${`rgb(${Mygame.chosenColor[0]},${Mygame.chosenColor[1]+ 1},${Mygame.chosenColor[2]})`}, ${`rgb(${Mygame.chosenColor})`}`)
		} else if (lvl < 40) {
			$('.right').css('background', `rgb(${Mygame.chosenColor[0]},${Mygame.chosenColor[1]},${Mygame.chosenColor[2]+1})`);
			Mygame.difference = 1 + " (Blue)";
			Mygame.win.css('background', `color-mix(in oklab, ${`rgb(${Mygame.chosenColor[0]},${Mygame.chosenColor[1]},${Mygame.chosenColor[2]+1})`}, ${`rgb(${Mygame.chosenColor})`}`)
		} else {
			$('.right').css('background', `rgb(${Mygame.chosenColor[0]+1},${Mygame.chosenColor[1]},${Mygame.chosenColor[2]})`);
			Mygame.difference = 1 + " (Red)";
			Mygame.win.css('background', `color-mix(in oklab, ${`rgb(${Mygame.chosenColor[0]+1},${Mygame.chosenColor[1]},${Mygame.chosenColor[2]})`}, ${`rgb(${Mygame.chosenColor})`}`)
		}
	}
	$('.left').click(function(){
		hideAll();
		Mygame.win.css('display', 'flex');
		Mygame.scorePanel.css('display', 'flex');
		Mygame.scorePanel.html(`<p>LVL ${Mygame.lvl+(Mygame.score+Mygame.combo +1> 10 ? " +1!" : "")}</p>
			<p>score ${(Mygame.score+Mygame.combo +1> 10 ? "5" : Mygame.score + " +" + (Mygame.combo+1))} /10</p>
			<p>combo ${Mygame.combo+" +1"}</p>
			${Mygame.lvl > 25 ? `difference: ${Mygame.difference}`: ""}`);
		Mygame.combo++;
		Mygame.score+=Mygame.combo;
		if (Mygame.score > 10) {Mygame.score = 5; Mygame.lvl++;Setup()}
		console.log(Mygame.score, Mygame.lvl)
	});
	$('.right').click(function(){
		hideAll();
		Mygame.loose.css('display', 'flex')
		Mygame.scorePanel.css('display', 'flex');
		Mygame.combo = 0;
		// Mygame.combo = Mygame.combo < 0 ? Mygame.combo -1 : 0;
		Mygame.scorePanel.html(`<p>LVL ${Mygame.lvl+(Mygame.score - 4 < 0 ? " -1!" : "")}</p>
			<p>score ${(Mygame.score -4 < 0 ? "5" : Mygame.score + " " + -4)} /10</p>
			<p>combo ${Mygame.combo}</p>
			${Mygame.lvl > 25 ? `difference: ${Mygame.difference}`: ""}`);
		Mygame.score += -4 + Mygame.combo;
		if (Mygame.score < 0) {Mygame.score = 5; Mygame.lvl --;Setup()}
		console.log(Mygame.score, Mygame.lvl)
	});
	$('.redo').click(function(){
		hideAll();
		showRandom();
	});
});

var getStyle = function(element, property) {
    return window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(property) : element.style[property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); })];
};