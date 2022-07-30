var cardLib=`Jester	Gamble with me! Gamble with me! You loose, you win, lets make it spin!	0	-2	Gambler was here.	You pay back to gambler as he smiles
Jester	Gamble with me! Gamble with me! You loose, you win, lets make it spin!	0	+5	Gambler was here.	Gambler pays you but
Jester	Gamble with me! Gamble with me! You loose, you win, lets make it spin!	0	0	Gambler was here.	Gambler greets you
Jester	Gamble with me! Gamble with me! You loose, you win, lets make it spin!	0	-2	Gambler was here.	Gambler smiles
Cult donation	Cult of Abractos is claiming that your donation of 3 will anable them to finally summon their godthing.	-1	-3 #	Abractos cult is punishing you for refusal by taking coins by force.	Abractos cult is happy with your donation and they made you a member #[Demons can't make you pay but you can still recive money from them]
Cult donation	Cult of Abractos is claiming that your donation of 3 will anable them to finally summon their godthing.	0	-3	You refused Aractos cult but they did nothing this time	You gave money to some mimiks that were only claiming to be Abractos
Cult donation	Cult of Abractos is claiming that your donation of 3 will anable them to finally summon their godthing.	-1	#	Abractos cult is punishing you for refusal by taking coins by force.	Your donation helped! World is destroyed! #[End of the game]!
Witch	Some witch says that she can tell you your your future for 2. (If down: you can look at the beck of your next card)	0	-2	Wich is not here anymore	Witch collcts her payment. "I'll see you again" - she says.
Begger 	Old guy asks for 1	0	0	Dead begger	Begger you promiced to pay is dead now
Begger 	Old guy asks for 1	0	0	Dead begger	Begger you promiced to pay is dead now
Begger 	Old guy asks for 1	0	-1	Old guy is alive but berely.	Begger is thanking you
Begger 	Old guy asks for 1	-4	0	Old guy is in ill rage. He takes your money by force. You run.	As you approach a begger he screams at you to run away.
Begger 	Old guy asks for 1	0	-1	Bagger looks at you with despair.	Old guy thanks you
Alchemist 	Alchemist  asks you to make a deal: you'll give him 3 and he'll double the rest of your money.	0	-3) *2	A Alchemist  that you refused a deal with has left his place.	Alchemist doubled your coins!
Demon	Demon demends 3	-All	-3	Demon takes all of your money by force	You repay 3 for Demon, as he demended.
Camp	Some guys are camping. They say that if you promice them 2 then they'll guard you once it's paid. 	0	-2 #	Camp is not here anymore	Guys in camp agree to guard you. #[You can't be forced to give away coins]
Camp	Some guys are camping. They say that if you promice them 2 then they'll guard you once it's paid. 	0	0	Camp is not here anymore	Camp is not here anymore. But you promiced to pay. They changed their mind?
Camp	Some guys are camping. They say that if you promice them 2 then they'll guard you once it's paid. 	-All	-All	You get ambushed by the camping guys. They take all of your money by force.	You get ambushed by the camping guys. They take all of your money by force.
Demon	Demon demends 3	-5	-3	Demon takes 5 by force.	You repay 3 for Demon, as he demended.
Jester	Take a bet! Take a bet! Will next move be quite bad?	-1 #	-1 #	Jester seems happy #[If previos card gave you coins: +5]	Jester seems sad #[If previous card lost you coins: +5]
Jester	Promice me! Promice me! Promice me coins!	-All	0	Jester takes coins by force. "All I needed was a promice."	Jester is saticefied with a promice.
Witch	Witch asks you for 3 coin. She says she'll curse you if you don't pay.	=0 #	-3	Your head spins. You feel your memory coming back. Where are you? #[Put this card on the beck and flip the deck]	Witch is grateful.
Jester	I know a shortcut! I know a shortcut! I'll show you for 5 coins! (If down: put next 5 cards at the back and only then put this card on the back)	0	-5 #	Jester looks at you from the bushes.	#[skip next 5 cards]
Alchemist 	Alchemist asks you to make a deal: you'll give him 3 and he'll double the rest of your money.	0	-3 -All +4	Alchemist left his place.	Alchemist failed to double your coin but he returned the payment and 1 coin as compensation.
Alchemist 	Do you want my new mixture? It glows! Only 1 coin for it.	0	-1 #	Alchemist left his place.	Alchemist gives you the mixture and you drink it. You feel streangth! #[From now on coins can't be taken from you by force]
Alchemist 	Do you want my new mixture? It glows! Only 1 coin for it.	0	-1 #	Alchemist left his place.	Alchemist gives you the mixture and you drink it. You feel bad! You die! #[Game over]
Alchemist 	Do you want my new mixture? It glows! Only 1 coin for it.	0	-1	Alchemist left his place.	Alchemist gives you the mixture and you drink it. You feel nothing!
Alchemist 	Do you want my new mixture? It glows! Only 1 coin for it.	0	-1 #	Alchemist left his place.	Alchemist gives you the mixture and you drink it. You feel holy! #[You can choose to not give coins to the demon, and they can't forse you]
Guy	You meet some guy. He asks you where you going. Do you reply honestly?	-3	#	It's not fair to lie to a stranger. He takes your coins by force.	It's only fair. If you too rich guy takes some coins by force. #[if you have >7: lose 6]`.split`
`.map(x=>toCard(x.split`	`));
function toCard(x) {
	return {
		'fname':x[0],
		'fDesc':x[1],
		'btCost':x[2],
		'bdCost':x[3],
		'btDesc':x[4],
		'bdDesc':x[5],
		'choosingTop':x=>{},
		'choosingDown':x=>{},
		'conseqTop':x=>{},
		'conseqDown':x=>{}
	}
}


function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


$( document ).ready(function() {
	
	var lib = shuffle(cardLib.slice(0));
	
});