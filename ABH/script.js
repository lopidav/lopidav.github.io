
var plrName;
var oppName;
var peer;
var connection;
var plr;
var opp;
var hist;
var plrMove;
var gamesHist = [];
window.onpopstate = function(event) {
	gotoLogon();
}

$( document ).ready(function() {
	gotoLogon();
	
	$("#lesgoButton").click(function(){
		console.log("startConnPro");
		
		plrName = $("#plrNameField").val();
		oppName = $("#oppNameField").val();
		
		/*switch(oppName.toLowerCase(){
		   case 'rand':
			   
			   break;*/
			
			
		var plrId = plrName ? getIdFromName(plrName) : "";
		var oppId = oppName ? getIdFromName(oppName) : "";
		console.log(plrName, oppName, plrId, oppId);
		
		
		gotoWait();

		
		peer = new Peer(plrId ? plrId : undefined);	
		peer.on('open', function(id) {
			if (plrId == '') plrId = id;
			
			peer.on('error', function(err) {
				switch(err.type) {
					case 'peer-unavailable':
						console.log("peer-unavailable");
						gotoWait();
						break;
					case 'unavailable-id':
						showMassage("Choose different name");
						gotoLogon();
						break;
					default:
						showMassage(err.type);
			}});

			peer.on('connection', function(dataConnection) {
				console.log("connected");
				if (oppId && dataConnection.metadata != oppId) {
					dataConnection.close();
					$("#wait").text($("#wait").text()+"\nSomebody attempted to connect");
					console.log('connected with wrong id');
				} else {
					connection = dataConnection;
					
					connection.on('data', function(data) {
						console.log("got massage", data);
						switch(data) {
							case "N":
								gotoPlay();
								break;
							case "R":
								opp.ready = true;
								refreshFieldUI();
								break;
							case "A":
							case "B":
							case "H":
								if (!plr.ready) {
									opp.ready = false;
								}
								else {
									plr.ready = false;
									connection.send(plrMove);
								}
								hist.push([data, plrMove]);
								plrMove = '';
								calcStateFromhist();
								break;
						}
					});
					console.log('connected from remote peer');
					gotoPlay();
				}
			});
			setTimeout(function() {
				if(!connection && oppId) {
					connection = peer.connect(oppId,{"metadata":plrId}).on('open', function() {
						
						connection.on('data', function(data) {
							console.log("got massage", data);
							switch(data) {
								case "N":
									gotoPlay();
									break;
								case "R":
									if (!plr.ready)
									{
										opp.ready = true;
										refreshFieldUI();
									} else {
										opp.ready = plr.ready = false;
										connection.send(plrMove);
									}
									break;
								case "A":
								case "B":
								case "H":
									if (!plr.ready) {
										opp.ready = false;
									}
									else {
										plr.ready = false;
										connection.send(plrMove);
									}
									hist.push([data, plrMove]);
									plrMove = '';
									calcStateFromhist();
									break;
							}
						});	
						
						gotoPlay();
						console.log(connection) ;
					});
					connection.on('error', function(err) {
						gotoWait();
						console.log(connection, err) ;
					});
				}
			}, 2000);
		});
		console.log("endConnPro");
	});
	
	$("#plrAttack").click(function(){
		if(plr.nA > 0) {
			plrMove = "A";
			if (opp.ready) {
				connection.send(plrMove);
			} else {
				if (!plr.ready) connection.send("R");
				plr.ready = true;
			}
			refreshFieldUI();
		}
	});
	$("#plrBlock").click(function(){
		if(plr.nB > 0) {
			plrMove = "B";
			if (opp.ready) {
				connection.send(plrMove);
			} else {
				if (!plr.ready) connection.send("R");
				plr.ready = true;
			}
			refreshFieldUI();
		}
	});
	$("#plrHeal").click(function(){
		if(plr.nH > 0) {
			plrMove = "H";
			if (opp.ready) {
				connection.send(plrMove);
			} else {
				if (!plr.ready) connection.send("R");
				plr.ready = true;
			}
			refreshFieldUI();
		}
	});
						  
	
	$(".newGame").click(function(){
		connection.send("N");
		gotoPlay();
		refreshFieldUI();
	});
	
});

function defPlr() { return {"hp":3,"nA":3,"nB":3,"nH":3,"ready":false};}

function hideAll() {
	$("#logon").hide();
	$("#wait").hide();
	$("#play").hide();
	$("#win").hide();
	$("#lose").hide();
	$("#tie").hide();
}

function gotoLogon() {
	hideAll();
	$("#logon").show();
}
	
function gotoWait() {
	history.pushState({'plrName': plrName, 'oppName': oppName},`true`,`?plrName=${plrName};oppName=${oppName}`);
	$(".plrName").text(plrName);
	hideAll()
	$("#wait").show();
}
	
function gotoPlay() {
	hideAll();
	$("#play").show();
	
	initGame();
	
}

function gotoWin() {
	hideAll();
	gamesHist.push`W`;
	$("#win").show();
}

function gotoLose() {
	hideAll();
	gamesHist.push`L`;
	$("#lose").show();
}

function gotoTie() {
	hideAll();
	gamesHist.push`T`;
	$("#tie").show();
}

function initGame() {
	plr = defPlr();
	opp = defPlr();
	hist = [];
	refreshFieldUI();
}

function calcStateFromhist() {
	plr = defPlr();
	opp = defPlr();
	for(var a of hist) {
		switch(a[0]+a[1]) {
			case "AA":
				opp.hp--;
				opp.nA--;
				plr.hp--;
				plr.nA--;
				break;
			case "AB":
				opp.nA--;
				plr.nB--;
				break;
			case "AH":
				opp.nA--;
				plr.hp--;
				plr.nH--;
				break;
			case "BA":
				opp.nB--;
				plr.nA--;
				break;
			case "BB":
				opp.nB--;
				plr.nB--;
				break;
			case "BH":
				opp.nB--;
				plr.hp++;
				plr.nH--;
				break;
			case "HA":
				opp.hp--;
				opp.nH--;
				plr.nA--;
				break;
			case "HB":
				opp.hp++;
				opp.nH--;
				plr.nB--;
				break;
			case "HH":
				opp.hp++;
				opp.nH--;
				plr.hp++;
				plr.nH--;
				break;
		}
		if (opp.hp > 3) opp.hp = 3;
		if (plr.hp > 3) plr.hp = 3;
		if (opp.hp == 0) break;
		if (plr.hp == 0) break;
	}
	if (opp.hp == 0 && plr.hp == 0) {gotoTie();;return;}
	if (hist.length == 9 && opp.hp == plr.hp) {gotoTie();return;}
	if (opp.hp == 0) {gotoWin();return;}
	if (plr.hp == 0) {gotoLose();return;}
	if (hist.length == 9 && opp.hp < plr.hp) {gotoWin();return;}
	if (hist.length == 9 && opp.hp > plr.hp) {gotoLose();return;}
	refreshFieldUI();
}



function refreshFieldUI() {
	$(".oppAttackAmount").text(opp.nA);
	$(".oppBlockAmount").text(opp.nB);
	$(".oppHealAmount").text(opp.nH);
	$(".oppHp").text(opp.hp);
	$("#oppSide").css("background-color", opp.ready ? "#9bf29c" : "inherit");
	
	
	$(".plrAttackAmount").text(plr.nA);
	$(".plrBlockAmount").text(plr.nB);
	$(".plrHealAmount").text(plr.nH);
	$(".plrHp").text(plr.hp);
	$("#plrSide").css("background-color", plr.ready ? "#9bf29c" : "inherit");
	
	$("#oppHistoryPanel").text(hist.map(x=>x[0]).join` `);
	$("#plrHistoryPanel").text(hist.map(x=>x[1]).join` `+ ' ' + (plr.ready ? plrMove : ""));
	
	$("#plrAttack").prop('disabled', plr.nA == 0);
	$("#plrBlock").prop('disabled', plr.nB == 0);
	$("#plrHeal").prop('disabled', plr.nH == 0);
	
	
	if(gamesHist.length) $("#gamesHistPanel").text(gamesHist.join``);//+`(${gamesHist.filter(x=>x=='W').length}/${gamesHist.filter(x=>x=='T').length}/${gamesHist.filter(x=>x=='L').length})`);
}

function showMassage(massaageTxt) {
	alert(massaageTxt);
}

function getIdFromName(name) {
	return "ABH-"+[...name.toLowerCase()].map(x=>x.charCodeAt(0)).join`-`;
}