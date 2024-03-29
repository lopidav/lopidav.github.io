

var Mygame = {};
$( document ).ready(function() {
	Mygame.straigt = $('#straigt');
    Mygame.swapped = $('#swapped');
    Mygame.win = $('#win');
    Mygame.loose = $('#loose');
	Mygame.one = document.createElement("img");
    Mygame.colorChoice = $('#colorChoice');
	Mygame.one.setAttribute("src", "./1.png");
    Mygame.scorePanel = $('#score');
	Mygame.chosenColor = [];
	Mygame.score = 5;
	Mygame.lvl = 0;
	Mygame.one.style = "max-width: 50%";
	Mygame.combo = 0;
	Mygame.back = $('#back');
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
				Mygame.chosenColor = [0,150,0];
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
		
		setWrongColorForLvl(getColorLvl(Mygame.lvl));
		setBorderForLvl(getBorderLvl(Mygame.lvl));
		setFlickeringForLvl(Mygame.lvl);
		// Mygame.loose.css('background', `rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)|0),a,a].join`,` })`)
	}
	function getBorderLvl(lvl) {
		if (lvl < 133) return  lvl;
		return lvl - 113;
	}
	function setBorderForLvl(lvl)
	{
		if (lvl < 42) {
			if (lvl == 20 && Mygame.chosenColor[0] == 200)
			{
				$('.left').html(Mygame.one);
				// $('.right').html(Mygame.one);
			}
			// $('.right').css("border", `none`);
			// $('.left').css("border", `none`);
		}
		else if (lvl < 55) {
			$('.right').css("width", "calc(100% - 1px)");
			$('.right').css("height", "100%");
			$('.left').css("width", "calc(100% - 1px)");
			$('.left').css("height", "100%");
			// $('.right').css("border", `solid 1px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			// $('.left').css("border", `solid 1px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
		}
		else if (lvl < 68) {
			$('.right').css("width", "calc(100% - 10px)");
			$('.right').css("height", "100%");
			$('.left').css("width", "calc(100% - 10px)");
			$('.left').css("height", "100%");
			// $('.right').css("border", `solid 10px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			// $('.left').css("border", `solid 10px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
		}
		else if (lvl < 81) {
			$('.right').css("width", "calc(90%)");
			$('.right').css("height", "calc(90%)");
			$('.left').css("width", "calc(90%)");
			$('.left').css("height", "calc(90%)");
			// $('.right').css("border", `solid 50px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			// $('.left').css("border", `solid 50px rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			Mygame.win.css('background', `color-mix(in oklab, rgb(${Mygame.chosenColor}) 90%, rgb(50,50,50)`)
		}
		else if (lvl < 94) {
			$('.right').css("width", "calc(70%)");
			$('.right').css("height", "calc(70%)");
			$('.left').css("width", "calc(70%)");
			$('.left').css("height", "calc(70%)");
			// $('.right').css("border", `solid 10vw rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			// $('.left').css("border", `solid 10vw rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			Mygame.win.css('background', `color-mix(in oklab, rgb(${Mygame.chosenColor}), rgb(50,50,50)`)
		}
		else if (lvl < 107) {
			$('.right').css("width", "calc(30%)");
			$('.right').css("height", "calc(20%)");
			$('.left').css("width", "calc(30%)");
			$('.left').css("height", "calc(20%)");
			// $('.right').css("border", `solid 20vw rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			// $('.left').css("border", `solid 20vw rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			Mygame.win.css('background', `color-mix(in oklab, rgb(${Mygame.chosenColor}), rgb(50,50,50)`)
		}
		else if (lvl < 120) {
			$('.right').css("width", "calc(10%)");
			$('.right').css("height", "calc(1px)");
			$('.left').css("width", "calc(10%)");
			$('.left').css("height", "calc(1px)");
			// $('.right').css("border", `solid 20vw rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			// $('.left').css("border", `solid 20vw rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			Mygame.win.css('background', `color-mix(in oklab, rgb(${Mygame.chosenColor}), rgb(50,50,50)`)
		}
		else if (lvl < 133) {
			$('.right').css("width", "calc(1px)");
			$('.right').css("height", "calc(1px)");
			$('.left').css("width", "calc(1px)");
			$('.left').css("height", "calc(1px)");
			// $('.right').css("border", `solid 20vw rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			// $('.left').css("border", `solid 20vw rgb(${ [(a=Mygame.chosenColor.reduce((y,x)=>y+x)/2.3|0),a,a].join`,` }`)
			Mygame.win.css('background', `color-mix(in oklab, rgb(${Mygame.chosenColor}), rgb(50,50,50)`)
		}
	}
	function getColorLvl(lvl)
	{
		if (lvl < 42) return  lvl;
		if (lvl < 133) return  (lvl - 42)%13 + 42-13;
		return getColorLvl(lvl - 100)
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
		Mygame.back.css('background', `color-mix(in oklab, rgb(${Mygame.chosenColor}), rgb(50,50,50)`);
	}
	function setFlickeringForLvl(lvl)
	{
		if (lvl < 133) {
			$('.first').css('animation', ``);
			$('.first').css('-webkit-animation', ``);
			$('.first').css('-moz-animation', ``);
			$('.first').css('-o-animation', ``);
			$('.last').css('animation', ``);
			$('.last').css('-webkit-animation', ``);
			$('.last').css('-moz-animation', ``);
			$('.last').css('-o-animation', ``);
			$('.last').css('opacity', "1");
		} else if (lvl < 142) {
			$('.first').css('animation', `flickerAnimation 3s infinite`);
			$('.first').css('-webkit-animation', `flickerAnimation 3s infinite`);
			$('.first').css('-moz-animation', `flickerAnimation 3s infinite`);
			$('.first').css('-o-animation', `flickerAnimation 3s infinite`);
			$('.last').css('animation', `reverseFlickerAnimation 3s infinite`);
			$('.last').css('-webkit-animation', `reverseFlickerAnimation 3s infinite`);
			$('.last').css('-moz-animation', `reverseFlickerAnimation 3s infinite`);
			$('.last').css('-o-animation', `reverseFlickerAnimation 3s infinite`);
			$('.last').css('opacity', "1");
		} else  if (lvl < 155) {
			$('.first').css('animation', `appearAnimation 1s forwards`);
			$('.last').css('animation', `disappearAnimation 0.1s forwards`);
			$('.last').css('opacity', "0");
		} else if (lvl < 168) {
			$('.first').css('animation', `appearDisappearAnimation 1.2s forwards`);
			$('.last').css('animation', `disappearAnimation 0.1s forwards`);
			$('.last').css('opacity', "0");
		} else  if (lvl < 181){
			$('.first').css('animation', `appearDisappear1pcAnimation 1s forwards`);
			$('.last').css('animation', `disappearAnimation 0.1s forwards`);
			$('.last').css('opacity', "0");
		} else {
			$('.first').css('animation', `appearDisappear1pxAnimation 1s forwards`);
			$('.last').css('animation', `disappearAnimation 0.1s forwards`);
			$('.last').css('opacity', "0");
		}
	}


	$('.leftBorder').click(function(){
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
	$('.rightBorder').click(function(){
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