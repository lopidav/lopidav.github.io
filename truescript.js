
$( document ).ready(function() {
    var straigt = $('#straigt');
    var swapped = $('#swapped');
    var win = $('#win');
    var loose = $('#loose');
    var lvl = $('#lvl');
	function hideAll() {
		straigt.hide();
		swapped.hide();
		win.hide();
		loose.hide();
		lvl.hide();
	}
	function showRandom() {
		if(Math.random()*2|0) {
			straigt.css('display', 'flex')
		} else {
			swapped.css('display', 'flex')
		}
	}
	window.onpopstate = function(event) {
		hideAll();
		lvl.css('display', 'grid')
	}
	$('.lvlbutton').click(function(e){
		console.log(e.target.innerHTML);
		switch(e.target.innerHTML) {
			case "5":
				$('.gebels').css('background', '#c1e829');
				history.pushState({lvl:5},"true","?lvl=5");
				break;
			case "4":
				$('.gebels').css('background', '#c1e821');
				history.pushState({lvl:4},"true","?lvl=4");
				break;
			case "3":
				$('.gebels').css('background', '#c1e81b');
				history.pushState({lvl:3},"true","?lvl=3")
				break;
			case "2":
				$('.gebels').css('background', '#c1e817');
				history.pushState({lvl:2},"true","?lvl=2");
				break;
			case "1":
				$('.gebels').css('background', '#c1e814');
				history.pushState({lvl:1},"true","?lvl=1");
				break;
		}
		hideAll();
		showRandom();
	});
	$('.mussolini').click(function(){
		hideAll();
		win.css('display', 'flex');
	});
	$('.gebels').click(function(){
		hideAll();
		loose.css('display', 'flex')
	});
	$('.redo').click(function(){
		hideAll();
		showRandom();
	});
});