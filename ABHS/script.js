// var oppHealth = 3;
// var oppAttackCards = 3;
// var oppBlockCards = 3;
// var oppHealCards = 3;

// var health = 3;
// var attackCards = 3;
// var blockCards = 3;
// var healCards = 3;

// var oppPlayedCards = [];
// var playedCards = [];
// var movesProccessed = 0;

// var currentOpponent;
var tournamentOpponents;
// var playerParticipates = true;

// var simulated = false;
// var inverted = false;

// function resetState() {
// 	 oppHealth = 3;
// 	 oppAttackCards = 3;
// 	 oppBlockCards = 3;
// 	 oppHealCards = 3;
	
// 	 health = 3;
// 	 attackCards = 3;
// 	 blockCards = 3;
// 	 healCards = 3;
	
// 	 oppPlayedCards = [];
// 	 playedCards = [];
// 	 movesProccessed = 0;

// 	 EndOfGameScreen.style.display = "none";

// 	 updateVisuals();
// }
// function updateVisuals() {
// 	if (simulated || !currentOpponent) return;
// 	OppName.innerHTML = currentOpponent.name;

// 	OppHealthBox.innerHTML = "❤".repeat(oppHealth) + "♡".repeat(3-oppHealth);
// 	HealthBox.innerHTML = "❤".repeat(health) + "♡".repeat(3-health);

// 	for (var i = 0; i < AttackCards.children.length; i++) {
// 		AttackCards.children[i].children[0].style.display = 2-attackCards < i ? "block" : "none";
// 	}
// 	for (var i = 0; i < BlockCards.children.length; i++) {
// 		BlockCards.children[i].children[0].style.display = 2-blockCards < i ? "block" : "none";
// 	}
// 	for (var i = 0; i < BlockCards.children.length; i++) {
// 		HealCards.children[i].children[0].style.display = 2-healCards < i ? "block" : "none";
// 	}
// 	var cardClass = "";
// 	var cardElement;

// 	for (var i = 0; i < 9; i++) {
// 		cardElement = OppPlayedCards.children[i].children[0];
// 		for (var j = 1; j < 5; j++) cardElement.classList.remove(cardIdToClass(j));
// 		cardClass = !oppPlayedCards[i] || playedCards[i] ? cardIdToClass(oppPlayedCards[i]) : "backCard";
// 		if (!cardClass) continue;
// 		cardElement.classList.add(cardClass);
// 	}
	
// 	for (var i = 0; i < 9; i++) {
// 		cardElement = PlayedCards.children[i].children[0];
// 		for (var j = 1; j < 5; j++) cardElement.classList.remove(cardIdToClass(j));
// 		cardClass = cardIdToClass(playedCards[i]);
// 		if (!cardClass) continue;
// 		cardElement.classList.add(cardClass);
// 	}

// }
function cardIdToClass(id) {
	return ["",...allCardClasses()][+id];
}
function allCardClasses() {
 return ["attackCard","blockCard","healCard","backCard"];
}
 
// function afterMoveActions() {
// 	if (!playedCards[movesProccessed] || !oppPlayedCards[movesProccessed]) {updateVisuals();return;}

// 	if (playedCards[movesProccessed] == 1 && oppPlayedCards[movesProccessed] != 2) {
// 		oppHealth--;
// 	}
// 	if (oppPlayedCards[movesProccessed] == 1 && playedCards[movesProccessed] != 2) {
// 		health--;
// 	}
// 	if (playedCards[movesProccessed] == 3 && oppPlayedCards[movesProccessed] != 1) {
// 		health++;
// 	}
// 	if (oppPlayedCards[movesProccessed] == 3 && playedCards[movesProccessed] != 1) {
// 		oppHealth++;
// 	}

// 	if (oppHealth > 3) oppHealth = 3;
// 	if (health > 3) health = 3;
// 	movesProccessed++;

// 	if (!simulated) WinLossCheck();
	
// 	if (currentOpponent.onMoveProcessed) currentOpponent.onMoveProcessed();
// 	updateVisuals();
// }
// function WinLossCheck() {
// 	if (oppHealth == 0 && health == 0) {Draw(); return "draw";}
// 	if (oppHealth == 0) {Win(); return "win";}
// 	if (health == 0) {Loss(); return "loss";}
// 	if (movesProccessed < 9) return false;
// 	if (oppHealth == health){Draw(); return "draw";}
// 	if (oppHealth < health) {Win(); return "win";}
// 	if (oppHealth > health) {Loss(); return "loss";}
// 	return false;
// }
function Draw() {
	updateVisuals();
	ShowEndGameScreen("Draw");
}
function Win() {
	updateVisuals();
	ShowEndGameScreen("Victory!");
}
function Loss() {
	updateVisuals();
	ShowEndGameScreen("You have lost =(");
	// TournamentLoss();
}
function ShowEndGameScreen(message) {
	// if (simulated) return;
	EndOfGameScreen.style.display = "flex";
	GameResult.innerHTML = message;
}
// function Attack() {
// 	if (attackCards <= 0) return false;
// 	playedCards.push(1);
// 	attackCards--;

// 	afterMoveActions();
// }
// function Block() {
// 	if (blockCards <= 0) return false;
// 	playedCards.push(2);
// 	blockCards--;

// 	afterMoveActions();
// }
// function Heal() {
// 	if (healCards <= 0) return false;
// 	playedCards.push(3);
// 	healCards--;

// 	afterMoveActions();
// }

// function oppDoMove(moveId) {
// 	switch(moveId) {
// 		case 1:
// 			return oppAttack();
// 		case 2:
// 			return oppBlock();
// 		case 3:
// 			return oppHeal();
// 	}
// 	return false;
// }
// function oppAttack() {
// 	if(inverted) return Attack();
// 	if (oppAttackCards <= 0) return false;
// 	oppPlayedCards.push(1);
// 	oppAttackCards--;

// 	afterMoveActions();
// 	return true;
// }
// function oppBlock() {
// 	if(inverted) return Block();
// 	if (oppBlockCards <= 0) return false;
// 	oppPlayedCards.push(2);
// 	oppBlockCards--;

// 	afterMoveActions();
// 	return true;
// }
// function oppHeal() {
// 	if(inverted) return Heal();
// 	if (oppHealCards <= 0) return false;
// 	oppPlayedCards.push(3);
// 	oppHealCards--;

// 	afterMoveActions();
// 	return true;
// }

// function simulateBattle(opp1, opp2) {
// 	simulated = true;
// 	opp1.onStart();

// 	inverted = true;
// 	opp2.onStart();
// 	inverted = false;
// 	afterMoveActions();
	
// 	var tryLimit = 1000;
// 	while (!WinLossCheck() && tryLimit--) {
// 		afterMoveActions();
// 		if (playedCards.length > oppPlayedCards.length && opp1.onMoveProcessed) opp1.onMoveProcessed();
// 		if (opp2.onMoveProcessed){inverted = true;opp2.onMoveProcessed();inverted = false;}
// 	}
// 	var game = {
// 		player1: opp1,
// 		player2: opp2,
// 		result: WinLossCheck() ? WinLossCheck() : "draw",
// 		playedCards: playedCards.slice(0),
// 		oppPlayedCards: oppPlayedCards.slice(0)
// 	}
// 	resetState();
// 	simulated = false;
// 	return game;
// }
// function getOppAttackCards() {
// 	if (inverted) return attackCards;
// 	return oppAttackCards;
// }
// function getOppBlockCards() {
// 	if (inverted) return blockCards;
// 	return oppBlockCards;
// }
// function getOppHealCards() {
// 	if (inverted) return healCards;
// 	return oppHealCards;
// }
// function getPlayedCards() {
// 	if (inverted) return oppPlayedCards;
// 	return playedCards;
// }
// var opponentPool = [
// 	{
// 		name:"Randie",
// 		onStart:() => {
// 			[1,2,3,1,2,3,1,2,3].sort(_=>Math.random()*2-1).forEach(x=>oppDoMove(x));
// 		}
// 	},
// 	{
// 		name:"Pak'l Dar",
// 		onStart:() => {
// 			[1,1,1,...[2,3,2,3,2,3].sort(_=>Math.random()*2-1)].forEach(x=>oppDoMove(x));
// 		}
// 	},
// 	{
// 		name:"Kate",
// 		onStart:() => {
// 			oppBlock();
// 		},
// 		onMoveProcessed:() => {
// 			if (oppDoMove(getPlayedCards()[movesProccessed-1])) return;
// 			oppDoMove(+[...('1'.repeat(getOppAttackCards())+'2'.repeat(getOppBlockCards())+'3'.repeat(getOppHealCards()))].sort(_=>Math.random()*2-1)[0]);
// 		}
// 	}
// ]


$( document ).ready(function() {
	var game = createGameObject(Player, opponentPresets.sort(_=>Math.random()*2-1)[0]);
	game.gameStart();

	// resetTournament();
	// doTournamentWave();
	// // resetState();
	// updateVisuals();
})
function newGame() {
	var game = createGameObject(Player, opponentPresets.sort(_=>Math.random()*2-1)[0]);
	game.gameStart();

}

// function resetTournament() {
// 	tournamentOpponents = opponentPool.slice(0).sort(_=>Math.random()*2-1);
// 	playerParticipates = true;
// }
// function doTournamentWave() {
// 	if (tournamentOpponents.length <= 0 && playerParticipates) return TournamentPlayerWin();
// 	if (!playerParticipates && tournamentOpponents.length ==1) console.log("Winner!!", tournamentOpponents[0]);
	
// 	resetState();

// 	if (playerParticipates) currentOpponent = tournamentOpponents.pop();

// 	var nextOpponents = [];
// 	var i = 1;
// 	for (; i < tournamentOpponents.length; i+=2) {
// 		var game = simulateBattle(tournamentOpponents[i-1], tournamentOpponents[i]);
// 		console.log(game);
// 		if (game.result == "win") {nextOpponents.push(tournamentOpponents[i-1])};
// 		if (game.result == "loss") {nextOpponents.push(tournamentOpponents[i])};
// 		if (game.result == "draw") {nextOpponents.push(tournamentOpponents[i]);nextOpponents.push(tournamentOpponents[i-1])};
// 	}
// 	tournamentOpponents = nextOpponents;
// 	console.log(tournamentOpponents);

// 	if (playerParticipates && currentOpponent.onStart) currentOpponent.onStart();

// }
// function TournamentLoss() {
// 	playerParticipates = false;
// }
// function TournamentPlayerWin() {
// 	EndOfGameScreen("Tournament Won!!!");
// }



function createGameObject(opp1, opp2) {
	return {
		started: false,
		ended: false,
		opp1: opp1,
		opp2: opp2,
		opp1Stats: {
			health : 3,
			attackCards : 3,
			blockCards : 3,
			healCards : 3,
			playedCards: []
		},
		opp2Stats: {
			health : 3,
			attackCards : 3,
			blockCards : 3,
			healCards : 3,
			playedCards: []
		},

		movesProccessed : 0,
		result: "",
		
		getOpp: function(WhoAsking) {
			if (this.opp1 === WhoAsking) return this.opp2;
			if (this.opp2 === WhoAsking) return this.opp1;
		},
		getOppStats: function(WhoAsking) {
			if (this.opp1 === WhoAsking) return this.opp2Stats;
			if (this.opp2 === WhoAsking)  return this.opp1Stats;
		},
		getMeStats: function(WhoAsking) {
			if (this.opp1 === WhoAsking) return this.opp1Stats;
			if (this.opp2 === WhoAsking)  return this.opp2Stats;
		},
		getMoveCards: function(WhoAsking, moveId) {
			switch(+moveId) {
				case 1:
					return this.getMeStats(WhoAsking).attackCards;
				case 2:
					return this.getMeStats(WhoAsking).blockCards;
				case 3:
					return this.getMeStats(WhoAsking).healCards;
			}
			return 0;
		},
		doMove: function(whoDidIt, moveId) {
			switch(+moveId) {
				case 1:
					return this.doAttack(whoDidIt);
				case 2:
					return this.doBlock(whoDidIt);
				case 3:
					return this.doHeal(whoDidIt);
			}
			return false;
		},
		doAttack: function(whoDidIt) {
			var meStats = this.getMeStats(whoDidIt);
			if (meStats.attackCards <= 0) return false;
			meStats.playedCards.push(1);
			meStats.attackCards--;
			this.afterMoveActions(whoDidIt);
			return true;
		},
		doBlock: function(whoDidIt) {
			var meStats = this.getMeStats(whoDidIt);
			if (meStats.blockCards <= 0) return false;
			console.trace();
			meStats.playedCards.push(2);
			meStats.blockCards--;
			this.afterMoveActions(whoDidIt);
			return true;
		},
		doHeal: function(whoDidIt) {
			var meStats = this.getMeStats(whoDidIt);
			if (meStats.healCards <= 0) return false;
			meStats.playedCards.push(3);
			meStats.healCards--;
			this.afterMoveActions(whoDidIt);
			return true;
		},
		afterMoveActions: function(WhoMoved) {
			if (this.opp1Stats.playedCards[this.movesProccessed] && this.opp2Stats.playedCards[this.movesProccessed])
			{
				if (this.opp1Stats.playedCards[this.movesProccessed] == 1 && this.opp2Stats.playedCards[this.movesProccessed] != 2) {
					this.opp2Stats.health--;
				}
				if (this.opp2Stats.playedCards[this.movesProccessed] == 1 && this.opp1Stats.playedCards[this.movesProccessed] != 2) {
					this.opp1Stats.health--;
				}
				if (this.opp1Stats.playedCards[this.movesProccessed] == 3 && this.opp2Stats.playedCards[this.movesProccessed] != 1) {
					this.opp1Stats.health++;
				}
				if (this.opp2Stats.playedCards[this.movesProccessed] == 3 && this.opp1Stats.playedCards[this.movesProccessed] != 1) {
					this.opp2Stats.health++;
				}
				if (this.opp2Stats.health > 3) this.opp2Stats.health = 3;
				if (this.opp1Stats.health > 3) this.opp1Stats.health = 3;
				this.movesProccessed++;
			}
			this.winLossCheck();
			if (!this.result && this.getOpp(WhoMoved).onOppMoved instanceof Function) this.getOpp(WhoMoved).onOppMoved(this);
			// updateVisuals();

		},
		winLossCheck: function() {
			if (this.opp1Stats.health == 0 && this.opp2Stats.health == 0) {this.gameEnd("draw");return "draw";}
			if (this.opp2Stats.health == 0) {this.gameEnd("1");return "win";}
			if (this.opp1Stats.health == 0) {this.gameEnd("2");return "loss";}
			if (this.movesProccessed < 9) return false;
			if (this.opp2Stats.health == this.opp1Stats.health){this.gameEnd("draw");return "draw";}
			if (this.opp2Stats.health < this.opp1Stats.health) {this.gameEnd("1"); return "win";}
			if (this.opp2Stats.health > this.opp1Stats.health) {this.gameEnd("2"); return "loss";}
			return false;
		},
		gameStart: function() {
			if (!this.opp1 || !this.opp2) return;
			this.started = true;
			this.opp1.currentGame = this;
			this.opp2.currentGame = this;
			if (this.opp2.onMatchStart instanceof Function) this.opp2.onMatchStart(this);
			if (this.opp1.onMatchStart instanceof Function) this.opp1.onMatchStart(this);
		},
		gameEnd: function(result) {
			this.result = result;
			if (this.OnGameEnd instanceof Function) this.OnGameEnd();
			if (result == "draw") {
				if (this.opp1.onDraw instanceof Function) this.opp1.onDraw();
				if (this.opp2.onDraw instanceof Function) this.opp2.onDraw();
			}
			if (result == "1") {
				if (this.opp1.onWin instanceof Function) this.opp1.onWin();
				if (this.opp2.onLoss instanceof Function) this.opp2.onLoss();
			}
			if (result == "2") {
				if (this.opp2.onWin instanceof Function) this.opp2.onWin();
				if (this.opp1.onLoss instanceof Function) this.opp1.onLoss();
			}
			if (!this.opp1.history) this.opp1.history = [];
			if (!this.opp2.history) this.opp2.history = [];
			this.opp1.history.push(this);
			this.opp1.currentGame = undefined;
			this.opp2.history.push(this);
			this.opp2.currentGame = undefined;

			this.ended = true;
		},
		OnGameEnd: undefined
	}
}

var opponentPresets = [
	{
		name:"Randie",
		onMatchStart:function(game) {
			[1,2,3,1,2,3,1,2,3].sort(_=>Math.random()*2-1).forEach(x=>game.doMove(this, x));
		}
	},
	{
		name:"Pak'l Dar",
		onMatchStart:function(game) {
			[1,1,1,...[2,3,2,3,2,3].sort(_=>Math.random()*2-1)].forEach(x=>game.doMove(this,x));
		}
	},
	{
		name:"Grock, the Destroyer",
		onMatchStart:function(game) {
			[2,2,2,...[1,3,1,3,1,3].sort(_=>Math.random()*2-1)].forEach(x=>game.doMove(this,x));
		}
	},
	{
		name:"Kate",
		onMatchStart:function(game) {
			game.doBlock(this);
		},
		onOppMoved:function(game) {
			var moveToBeat =game.getOppStats(this).playedCards[game.movesProccessed-1]
			if (game.doMove(this, moveToBeat == 3 ? 1 : moveToBeat+1)) return;
			console.log("failed to do desiered move for",this.name)
			game.doMove(this, +[...('1'.repeat(game.getMoveCards(this,1))+'2'.repeat(game.getMoveCards(this,2))+'3'.repeat(game.getMoveCards(this,3)))].sort(_=>Math.random()*2-1)[0]);
		}
	},
	{
		name:"Ma Guy",
		onMatchStart:function(game) {
			if(Math.random()<0.3) game.doBlock(this);else game.doAttack(this);
		},
		onOppMoved:function(game) {
			var numCardsPlayed=[[1,game.getMoveCards(game.getOpp(this),1)],[2,game.getMoveCards(game.getOpp(this),2)],[3,game.getMoveCards(game.getOpp(this),3)]];
			numCardsPlayed.sort((x,y)=>y[1]-x[1]?y[1]-x[1]:Math.random()*2-1);
			if (game.doMove(this, numCardsPlayed[0][0]==3 ? 1 : numCardsPlayed[0][0]+1)) return;
			console.log("failed to do desiered move for",this.name)
			game.doMove(this, +[...('1'.repeat(game.getMoveCards(this,1))+'2'.repeat(game.getMoveCards(this,2))+'3'.repeat(game.getMoveCards(this,3)))].sort(_=>Math.random()*2-1)[0]);
		}
	},
	{
		name:"King Lios",
		onMatchStart:function(game) {
			game.doMove(this, +[...('1'.repeat(game.getMoveCards(this,1))+'2'.repeat(game.getMoveCards(this,2))+'3'.repeat(game.getMoveCards(this,3)))].sort(_=>Math.random()*2-1)[0]);
		},
		onOppMoved:function(game) {
			game.doMove(this, +[...('1'.repeat(game.getMoveCards(this,1))+'2'.repeat(game.getMoveCards(this,2))+'3'.repeat(game.getMoveCards(this,3)))].sort(_=>Math.random()*2-1)[0]);
		}
	}
]
var Player = {
	name:"Player",
	onMatchStart:function(game) {
		updateVisuals();
	},
	onOppMoved:function(game) {
		updateVisuals();
	},
	onLoss: Loss,
	onDraw: Draw,
	onWin: Win
}
function updateVisuals() {
	if (!Player.currentGame) return;
	var opp = Player.currentGame.getOpp(Player);
	var oppStats = Player.currentGame.getOppStats(Player);
	var meStats = Player.currentGame.getMeStats(Player);
	
	 EndOfGameScreen.style.display = "none";
	OppName.innerHTML = opp.name;

	OppHealthBox.innerHTML = "❤".repeat(oppStats.health) + "♡".repeat(3-oppStats.health);
	HealthBox.innerHTML = "❤".repeat(meStats.health) + "♡".repeat(3-meStats.health);

	for (var i = 0; i < AttackCards.children.length; i++) {
		AttackCards.children[i].children[0].style.display = 2-meStats.attackCards < i ? "block" : "none";
	}
	for (var i = 0; i < BlockCards.children.length; i++) {
		BlockCards.children[i].children[0].style.display = 2-meStats.blockCards < i ? "block" : "none";
	}
	for (var i = 0; i < BlockCards.children.length; i++) {
		HealCards.children[i].children[0].style.display = 2-meStats.healCards < i ? "block" : "none";
	}
	var cardClass = "";
	var cardElement;

	for (var i = 0; i < 9; i++) {
		cardElement = OppPlayedCards.children[i].children[0];
		for (var j = 1; j < 5; j++) cardElement.classList.remove(cardIdToClass(j));
		cardClass = !oppStats.playedCards[i] || meStats.playedCards[i] ? cardIdToClass(oppStats.playedCards[i]) : "backCard";
		if (!cardClass) continue;
		cardElement.classList.add(cardClass);
	}
	
	for (var i = 0; i < 9; i++) {
		cardElement = PlayedCards.children[i].children[0];
		for (var j = 1; j < 5; j++) cardElement.classList.remove(cardIdToClass(j));
		cardClass = cardIdToClass(meStats.playedCards[i]);
		if (!cardClass) continue;
		cardElement.classList.add(cardClass);
	}

}
function Attack() {
	if(!Player.currentGame) return;
	Player.currentGame.doAttack(Player);
	updateVisuals();
}
function Block() {
	if(!Player.currentGame) return;
	Player.currentGame.doBlock(Player);
	updateVisuals();
}
function Heal() {
	if(!Player.currentGame) return;
	Player.currentGame.doHeal(Player);
	updateVisuals();
}