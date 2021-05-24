
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
	$('.lvlbutton').click(function(e){
		console.log(e.target.innerHTML);
		switch(e.target.innerHTML) {
			case "5":
				$('.gebels').css('background', '#c1e829')
				break;
			case "4":
				$('.gebels').css('background', '#c1e821')
				break;
			case "3":
				$('.gebels').css('background', '#c1e81b')
				break;
			case "2":
				$('.gebels').css('background', '#c1e817')
				break;
			case "1":
				$('.gebels').css('background', '#c1e814')
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