function str2Deck(a){return a.replace(/"((\w|\W)*?)"/g,x=>x.replace(/\n/g,'').slice(1,-1)).split`\n`.map((x,i)=>{var w= x.split`\t`;return {'name':w[0],'id':i,'cost':w[1],'ae':w[2],'pe':w[3]};})}
function shuffle(a) {var j, x, i;for (i = a.length - 1; i > 0; i--) {j = Math.floor(Math.random() * (i + 1));x = a[i];a[i] = a[j];a[j] = x;};return a;}
function presentHand(a) {return a.map(x=>`${x.cost} ${x.name}\n\tae:${x.ae}\n\tpe:${x.pe}`).join`\n`;}


var strLibrary = '';

//fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQa2mgamoSlsBTvfbyPr6QvP9fWifPbgnkneHLcnxVPgZLmx01FMYCpbdrDWQ8shjTk1er9ae-EFDLR/pubhtml").then((r)=>{r.text().then((d)=>{strLibrary = d})})

if(strLibrary=='') {
	strLibrary = `Stealing	1	choose a player. They lose 5 resource. You gain 4 resource.	if wasn’t activated, lose 5 resources
Presenting	3	gain 23 resource.	lose 23 resource.
Replace	2	draw a card from the deck	if wasn’t activated, lose 1 resource.
Cooperation is not welcome	5	lose 1 resource	If wasn’t activated, every player that has less resource than you gains resource equal to the difference then loses one resource.
Forget	3	Shuffle all discarded cards into the deck.	Trigger all “Play” affects of all discarded cards (you may choose the order).
Stone season	1		"Whenever you’re rolling a dice this turn, if that roll wasn't commanded by this card, roll two dice instead and use the sum as result
"
Invest	1	roll a dice, lose an amount of resource equal to the result then put the result on this card.	If there is result on this card, gain an amount of resource equal to the sum of results on this card.
Next time offer	4	roll a dice and put result on this card. When you would pay the cost of you next card activation instead lose amount of resource equal to the result on this card.	lose 2 resource.
Fate	1	roll a dice and put the result on this card. When you would roll dice this turn you may choose to instead use the result on this card as a result.	If there is a result on this card, lose an amount of resource equal to the sum of results on this card.
Same thing	1	When you would gain amount of resource this turn, instead each other player loses that amount of resource.	If wasn't activated, lose 3 resource. Otherwise, gain 3 resource.
one-faced coin	1	gain 1 resource.	if wasn’t activated, lose 1 resource.
two-faced coin.	2	gain 2 resource.	If wasn’t activated, lose 2 resource.
three-faced coin	3	gain 3 resource	if wasn't activated, lose 3 resource
four-faced coin	4	gain 4 resource	if wasn't activated, lose 5 resource
Scissors season	3	lose amount of resource equal to your resource count.	if this card was activated, gain amount of resource equal to your resource count.
Emphasis	5	choose already activated card, trigger their “Activate” effect.	lose 3 resource.
Transfering	3	"choose a player. That player loses an amount of resource equal to their resource count. If they do, you gain that amount.
"	"choose a player. Lose an amount of resource equal to your resource count. If you do, the chosen player gains that amount.
"
Diplomacy is cooperation	1	every player loses 1 resource.	if wasn't activated, every player loses 3 resource.
Sponsor	5	"if you have less then 3 resource, gain 15 resource.

"	Lose 3 resource
Trauma	1	For each discarded card gain 1 resource.	lose resource equal to the discarded cards count.
It was all a dream	1	activate all of the cards in your hand without paing their costs.	lose amount of the resource equal to your resource count.
Pandering	3	roll a dice	lose 2 resource
Rotate	1	whenever you'll roll a dice this turn, gain 1 resource	roll a dice. If you do, lose amount of resource equal to the result
Diary	1	lose 3 resource	if was activated, put all discarded cards in your hand
Achive	11	lose 1 resource	If was activated, lose 1 resource.
Cooperation is a sin	5	Each other player loses amount of resource equal to their resource count. Gain amount of resource equal to the amount of resource that was lost due to this effect.	lose amount of resource equal to your resource count.
Timing	1	whenever you lose resource this turn lose 1 resource	If was activated, gain 3 resource
Reversing	3	whenever you would gain any amount of resource this turn, instead lose this amount of resource.	whenever you would lose any amount of resource this turn, if that loss wasn't commanded by this card, instead gain this amount of resource.
Activating	3	gain 1 resource	if wasn't activated, lose 15 resource
Good management	1	roll a dice. If result is 1, gain 5 resource	lose 11 resource
Private property	3	if there are no player with resource count greater than or equal to your resource count, gain 3 resource.	lose amount of resource equal to sum of all other player's resource count.
Donkey throwing cards	3	roll a dice. If you do, gain amount of resource equal to 1.	Roll a dice. If you do, lose amount of resource equal to the result.
Optimize	1	If you would roll a dice this turn, do nothing instead and use 0 as a result.	roll a dice. If you don't, gain 5 resource.
Math	3	gain 5 resource	if wasn't activated, gain 3 resource
Four	3	whenever you roll a dice this turn, do nothing instead and use 3 as a resut	lose 3 resource
Deserving	3	if any other player has more than 3 resource, gain 3 resource	lose 1 resource
Capitalize	1	whenever you gain an amount of resource this turn, instead roll a dice and gain amount of resource equal to the result	lose 5 resource
Same thing	3	Gain 1 resource 5 times	lose 5 resource.
Cooperation is not you	3	Roll a dice. Each other player gains amount of resource equal to the result.	Loose amount of resource equal to your resource count
Work	3	Roll a dice. If the result is 1, draw a card.	Lose 3 resource.
I did what	3	Gain 1 resource for each activated card.	lose 3 resource
Hi Risk	1	Whenewer you would lose an amount of resource this turn, instead lose twise the amount.	If was activated, gain 11 resource
Privilige	5	if you would lose an amount of resource this turn, loose 1 resource instead	loose 13 resource
Bootstrapping	1	If there are no player with resource count lesser then yours, all other players lose 1 resource and trigger this effect again.	Lose 3 resource
Trick choice	3	Roll a dice. Roll a dice Choose one of the results. Gain amount of resource equal to chosen result. Lose amount of resource equal to result not chosen.	if wasn't activated, lose 3 resource
Cooperation is sharing	1	Choose a player. If you do, when you would gain an amount of resource this turn chosen player gains same amount of resource.	Lose amount of resource equal to your resource count
Snowballing	3	If there no players with resource count greater than your resource count, gain 3 resource.	If wasn't activated, lose 3 resource.
Bartering	1	whenever you would lose an amount of resource this turn, instead choose and discard a card from your hand.	lose 5 resource
Hi Reward	3	Roll a dice. Put the result on this card	If there is a result on this card, gain 1 resource and roll a dice. If result of the roll is bigger then the sum of results on this card, trigger this effect again.
Get more of it	3	Choose a number. Roll a dice. If the result is equal to or bigger then chosen number, gain amount of resource equal to the chosen number.	Lose 2 resource
Cooperation is thinking about yourself	1	Choose a player and roll a dice. Chosen player looses amount of resource equal to the result.	If wasn't activated, loose amount of resource equal to your resource count.
Training	1	when the effect would be triggered this turn, instead trigger same effect but with all numbers replaced by 0	lose 21 resource
Studying	2	Roll a dice. If the result is equal to or less then 1, draw three cards.	lose 3 resource
Cooperation is a stone	5	After a player rolls a dice this turn, if the result is an odd number, gain amount of resource equal to the result, otherwise lose amount of resource equal to the result.	Each player rolls a dice.
Digging	1	Show top card of the deck. You may choose to draw that card.	Show top card of the deck. Lose amount of resource equal to the cost of the top card of the deck.
Recharge	5	End your turn (shuffle all of the cards in the deck and pass your turn to the next player)	Whenever you roll a dice this turn, use 0 as a result. Lose amount of resource equal to your resource count. End your turn.
Countering	1	Whenever an effect would be triggered this turn, instead lose amount of resource equal to your resource count.	lose 3 resource
Trivia	3	gain amount of resource equal to your hand cards count	lose 5 resource
It's probably a coin	0	Look at the top card of the deck.	Lose 3 resource
Summing costs	5	Choose a number. Reveal an amount of cards equal to the chosen number from the top of the library. If all of the reveal cards share cost, gain amount of resource equal to the sum of costs of all revealed cards.	if wasn't activated, lose 11 resource.
interrogation	1	gain 3 resource	lose an amount of resource equal to activated cards count 
Cooperation is incredulous	5	Choose other player. That player looks at the top card of the library. Choose a number. Reveal a top card of the deck. If cost of the revealed card is equal to the chosen number, gain 11 resource, otherwise chosen player gains 5 resource	Lose 1 resource
Big odds	3	Rool a dice. If the result is equal to or less then 1 gain 11 resource, otherwise lose 1 resource and trigger this effect 	if wasn't activated, lose 3 resource
Sanding	1	Roll a dice and put the result on this card. Whenever you would roll a dice this turn, instead roll a dice and use the result of the roll minus sum of results on this card as a result.	Roll a dice, lose amount of resource equal to the result
Cover unknown	1	Choose discarded card. Put chosen card on the top of the deck.	if wasn't activated, lose 5 resources
Cooperation is golden	5	Each other player gains amount of resource equal to your resource count	Lose amount of resource equal to your resource count
Paper season	1	Gain 13 resource. Reveal top card of the deck and put it under this card.	Trigger "play" effect of the card under this card. If you can't, lose 5 resource
Good for me	3	If there is no other player with resource count greater than or equal to your resource count, whenever a player loses an amount of resource, gain 1 resource	each player loses 1 resource
Cooperation is when not alone	1	gain 3 resource	roll a dice. If result is greater than player count, lose 5 resource
Housing	3	roll a dice and put result on this card. Gain amount of resource equal to the sum of all results on all of the cards.	Lose 3 resource
Uninterested	3	Roll a dice. Reveal a number of cards from the top of the deck equal to the result. Discard all revealed cards.	If wasn't activated, lose 3 resource
Lose ball	1	whenever you lose an amount of resource this turn, roll a dice and put the result on this card.	Lose 3 resource. Gain an amount of resource equal to the sum of results on this card
Gaining little	1	Gain 3 resource	Roll a dice. lose amount of resource equal to the result
Probabilition	1	whenever you would roll a dice this turn, instead reveal and discard top card of the deck. I you do, use the cost of the revealed card as the result, otherwise use 0 as a result.	Roll a dice. Lose amount of resource equal to the result.
Stone ball	1	whenever you would roll a dice this turn, instead roll a dice then put the result of that roll on this card then use the sum of all results on this cards as the result.	Lose 5 resource. Gain amount of resource equal to the sum of the results on this card.
Confabulation	3	Roll a dice and put the result on this card. Look at the top card of the deck. Roll a dice.	If wasn't activated, lose 3 resource
Gaslighting	4	Choose an activated card. Move chosen card to your hand.	Lose 3 resource
Getting a five	3	Choose and reveal a card from your hand. Roll a dice. If the result is equal to or bigger then revealed card cost, you may activate revealed card without paying it's cost this turn.	Lose 1 resource.
Onety one	11	Roll a dice. Roll a dice. If both results are equal to 1, get 11 resource, otherwise trigger this effect again.	If wasn't activated, lose 11 resource.
One-time offer	3	Whenever you would lose an amount of resource this turn, you may choose to instead roll a dice and lose amount of resource equal to the result	Lose 3 resource. [Roll a dice. Lose amount of resource equal to the result.]
Fulling	1	whenever you would gain an amount of resource this turn, instead draw a card	lose amount of resource equal to your resource count
Trying	3	roll a dice. You may choose to reveal a card from your hand with cost that is less then the roll result. if you do, activate revealed card without paying it's cost. If you don't reveal a card, trigger this effect again.	Lose 13 resource
Cooperation is big	1	Chose a player. That player chooses a number. Roll a dice. If result is greater then or equal to the chosen number, gain amount of resource equal to the result, otherwise lose amount of resource equal to the chosen number	If wasn't activated, lose 3 resource
Rebelling	1	Choose a card with a result on it and remove all results from it. [Roll a dice. Put the result of the roll on the chosen card.]	If wasn't activated, roll a dice and lose amount of resource equal to the result.
Bonusing	3	whenever you would activate a card this turn, gain amount of resource equal to the cost of the card that would be activated.	Lose 3 resource.
Discounting	3	when you discarded any amount of cards this turn, for each of the discarded cards, roll a dice and if the result is equal to or less then 1, move that card to your hand.	lose amount of resource equal to your resource count.
Show it	5	Roll a dice. Reveal and activate top card of the deck. If the result of the roll is equal to or less then 1, trigger this effect again.	Lose all of your resource.
Pulling	3	whenever you would draw a card this turn, instead reveal the top card of the deck and put it inder this card.	If there no cards under this one, lose 11 resource. Otherwise, for each card under this card trigger its "activate" effect and trigger its "play" effect.
Aversion	1	Whenever an effect of other card would be triggered this turn, roll a dice and if the result is bigger then 1, cancel the effect. 	lose 15 resource
Communing	2	For each other player, they may choose to loose 1 resource, if they don't, gain 1 resource	For each other player, they may choose to gain 1 resource, if they do, lose 1 resource.
Doubling resources	3	When you would gain an amount of resource this turn, you may choose to instead roll a dice and if the result is less then of equal to 1 then you gain the amount of resource and gain the amount of resource again.	If wasn't activated, lose 5 resource.
Upcounting	1	When you would gain an amount of resource equal to 1 this turn, gain 5 resource instead.	If was activated, gain 2 resource.
Priorities	1	When you would gain an amount of resource this turn, instead roll a dice a number of times equal to the amount.	If was activated, gain 21 resource.
Alling	3	When you would lose an amount of resource this turn instead lose amount af resource equal to your resource count.	If was activated, gain 15 resource. Otherwise, lose 1 resource.
Eye in system	3	Roll a dice. You may put the result of the roll on this card. If you don't, trigger this effect again.	If there is a result on this card, gain amount of resource equal to the sum of results on this card. Lose 3 resource.
Waging	1	Gain amount of resource equal to the sum of results on all cards.	Lose 3 resource.
Consequences	1	Reveal and discard top card of the deck. Gain amount of resource equal to the discarded card cost. Reveal and discard top card of the deck. Lose amount of resource equal to the discarded card cost.	Reveal and discard top card of the deck. Lose 3 resource.
Mastering	3	Roll a dice. You may choose to reveal all cards of the deck. If you do, gain amount of resource equal to the number of revealed cards with cost equal to the result of the roll.	lose 5 resource.
Stone cage	3	Roll a dice. Put the result on each activated card.	For each card with a result on it, lose 1 resource.
Cooperation should be illegal	3	Choose other player. They lose amount of resource equal to your resource count. Gain amount of resource equal to the resource count of chosen player.	All players gain amount of resource equal to your resource count. Loose amount of resource equal to your resource count.`
}

library = str2Deck(strLibrary)
deck = shuffle(library)

function card2Div(card) {return $(`<div class="card"><div class="header">${card.cost} ${card.name}</div><div class="ae">ae: ${card.ae}</div><div class="pe">pe:${card.pe}</div></div>`);}
function createDiceDiv(x) {return $(`<div class="dice">${x?x:(Math.random()*6|0)+1}</div>`);}



$( document ).ready(function() {
    $("#count").text(deck.length);
	$(`#resourceCount`)[0].value = window.localStorage.getItem('resourceCount') === null ? 0 : window.localStorage.getItem('resourceCount');
	$(`#resourceCount`).change(x=>window.localStorage.setItem('resourceCount', x.currentTarget.value));
    $("#shuffle").click(x=>{
        deck = shuffle(deck);
        console.log('shuffled');
    })
    $("#take7").click(x=>{
        deck.slice(0,7).forEach(x=>$("#cards").prepend(card2Div(x)));
        deck = deck.slice(7);
        $("#count").text(deck.length);
        console.log('took 7');
    })
    $("#take1").click(x=>{
        $("#cards").prepend(card2Div(deck[0]));
        deck = deck.slice(0);
        $("#count").text(deck.length);
        console.log('took 1');
    })
    $("#reset").click(x=>{
        $("#cards").text('');
        $("#diceSlot").text('');
        deck = shuffle(library);
        $("#count").text(deck.length);
        console.log('reseted');
    })
    $("#roll").click(x=>{
        $("#diceSlot").append(createDiceDiv((Math.random()*6|0)+1));
        console.log('rolled');
    })
});

interact('.dice')
  .draggable({
    // keep the element within the area of it's parent
    modifiers: [
      interact.modifiers.restrictRect({
        endOnly: true
      })
    ],

    listeners: {
      // call this function on every dragmove event
      move: dragMoveListener,

      // call this function on every dragend event
      end (event) {
        
      }
    }
  })

interact('.resizable-horisontal')
	.resizable({
	edges: { right: true},

	listeners: {
	  move (event) {
		var target = event.target
		var x = (parseFloat(target.getAttribute('data-x')) || 0)
		var y = (parseFloat(target.getAttribute('data-y')) || 0)

		// update the element's style
		target.style.width = event.rect.width + 'px'
		target.style.height = event.rect.height + 'px'

		// translate when resizing from top or left edges
		x += event.deltaRect.left
		y += event.deltaRect.top

		target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

		target.setAttribute('data-x', x)
		target.setAttribute('data-y', y)
	  }
	},
	modifiers: [
	  // minimum size
	  interact.modifiers.restrictSize({
		min: { width: 5, height: 5 }
	  })
	],

	inertia: true
  })

interact('.dice')
  .on('hold', function (event) {
	var tmp = event.currentTarget.innerText;
    event.currentTarget.innerText = ``;
    $(event.currentTarget).append($(`<input class="resizable-horisontal" type="text" style="
    width: 15px;
" value="${tmp}">`))
	
	
	
    event.preventDefault()
  })




// target elements with the "draggable" class
interact('.card')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],
    // enable autoScroll
    //autoScroll: true,

    listeners: {
      // call this function on every dragmove event
      move: dragMoveListener,

      // call this function on every dragend event
      end (event) {
        
      }
    }
  })
  .on('doubletap', function (event) {
	event.currentTarget.classList.toggle('activated')
	event.currentTarget.classList.remove('putted')
    event.preventDefault()
  })
  .on('hold', function (event) {
	event.currentTarget.classList.toggle('putted')
	event.currentTarget.classList.remove('activated')
    event.preventDefault()
  })

function dragMoveListener (event) {
  var target = event.target
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  // translate the element
  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

// this function is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener


