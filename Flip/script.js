document.addEventListener("DOMContentLoaded", onStart);

var savedVariable = localStorage.getItem("startingPoints");
var startingPoints = savedVariable === null ? goodRound(new bigDecimal((Math.random()*10) ** (Math.random()*10))) : new bigDecimal(savedVariable);
// localStorage.setItem("startingPoints", startingPoints.getValue())

savedVariable = localStorage.getItem("points");
var points = savedVariable === null ? goodRound(startingPoints) : new bigDecimal(savedVariable);

savedVariable = localStorage.getItem("previousPoints");
var previousPoints = savedVariable === null ? points : new bigDecimal(savedVariable);

savedVariable = localStorage.getItem("generatedName");
var generatedName = savedVariable === null ? generateName() : savedVariable;

savedVariable = localStorage.getItem("leaderboardId");
var leaderboardId = "";
if (savedVariable === null || savedVariable == "")
{
  // sendScore(true)
}
else leaderboardId = savedVariable;

var lastSentPoints = new bigDecimal(0);

var leaderboards = [];
var tempLeaderboards = [];
getLeaderboards();
setInterval(sendScore, 60000);
setInterval(getLeaderboards, 10000);
var optionPrefabs = [
  function(startPoints, seed, loseSeed) {
    var value = {};
    value.prefabId = 0;
    value.seed =  seed ?? goodRound(new bigDecimal(Math.random()).multiply(startPoints.divide(new bigDecimal(2))).add(startPoints.divide(new bigDecimal(2))));
    value.loseSeed = loseSeed ?? new bigDecimal(0);
    value.onWin =  function() {
      return points.add(value.seed);
    };
    value.onLose = function() {
      return points.add(value.seed.negate());
    };
    value.text = `heads: +${value.seed.getPrettyValue()}; tails: -${value.seed.getPrettyValue()}`;
    return value;
  },
  function(startPoints, seed, loseSeed) {
    var value = {};
    value.prefabId = 1;
    value.seed =  seed ?? goodRound(new bigDecimal(Math.random()).multiply(startPoints).multiply(startPoints));
    value.loseSeed = loseSeed ?? goodRound(new bigDecimal(Math.random()).multiply(startPoints).multiply(startPoints));
    value.onWin =  function() {
      return points.add(value.seed);
    };
    value.onLose = function() {
      return points.add(value.loseSeed.negate());
    };
    value.text = `heads: +${value.seed.getPrettyValue()}; tails: -${value.loseSeed.getPrettyValue()}`;
    return value;
  },
  function(startPoints, seed, loseSeed) {
    var value = {};
    value.prefabId = 2;
    value.seed = seed ?? goodRound(new bigDecimal(Math.random()).multiply(new bigDecimal(100))).divide(new bigDecimal(100));
    value.loseSeed = loseSeed ?? goodRound(new bigDecimal(Math.random()).multiply(value.seed).multiply(new bigDecimal(100))).divide(new bigDecimal(100));
    value.onWin = function() {
      return points.multiply(new bigDecimal(1).add(this.seed));
    };
    value.onLose = function() {
      return points.multiply(new bigDecimal(1).add(this.loseSeed.negate()));
    };
    value.text = `heads: +${value.seed.multiply(new bigDecimal(100)).getPrettyValue()}%; tails: -${value.loseSeed.multiply(new bigDecimal(100)).getPrettyValue()}%`;
    return value;
  },
  function(startPoints, seed, loseSeed) {
    var value = {};
    value.prefabId = 3;
    value.seed = seed ?? new bigDecimal(Math.random()*2+1|0);
    value.loseSeed = loseSeed ?? new bigDecimal(1);
    value.onWin = function() {
      var newPoints = points;
      for(var i = 1; i < +value.seed.getValue();i++) newPoints=newPoints.multiply(points)
      return newPoints;
    };
    value.onLose = function() {
      return points.multiply(new bigDecimal(1).add(this.loseSeed.negate()));
    };
    value.text = `heads: ^${value.seed.getPrettyValue()}; tails: -${value.loseSeed.multiply(new bigDecimal(100)).getPrettyValue()}%`;
    return value;
  },
  function(startPoints, seed, loseSeed) {
    var value = {};
    value.prefabId = 4;
    value.seed = seed ?? goodRound(new bigDecimal(Math.random()*100).multiply(new bigDecimal(100))).divide(new bigDecimal(100));
    value.loseSeed = loseSeed ?? goodRound(new bigDecimal(Math.random()*100));
    value.onWin = function() {
      return points.multiply(new bigDecimal(1).add(this.seed));
    };
    value.onLose = function() {
      return value.loseSeed;
    };
    value.text = `heads: +${value.seed.multiply(new bigDecimal(100)).getPrettyValue()}%; tails: =${value.loseSeed.getPrettyValue()}`;
    return value;
  },
  function(startPoints, seed, loseSeed) {
    var value = {};
    value.prefabId = 5;
    value.seed = seed ?? goodRound(new bigDecimal(Math.random()*100).multiply(new bigDecimal(Math.random()*100)));
    value.loseSeed = loseSeed ?? goodRound(new bigDecimal(Math.random()).multiply(new bigDecimal(100))).divide(new bigDecimal(100));
    value.onWin = function() {
      return value.seed;
    };
    value.onLose = function() {
      return points.multiply(new bigDecimal(1).add(this.loseSeed.negate()));
    };
    value.text = `heads: =${value.seed.getPrettyValue()}; tails: -${value.loseSeed.multiply(new bigDecimal(100)).getPrettyValue()}%`;
    return value;
  },
  function(startPoints, seed, loseSeed) {
    var value = {};
    value.prefabId = 6;
    value.seed = seed ?? goodRound(new bigDecimal(Math.random()*10).multiply(new bigDecimal(100)));
    value.loseSeed = loseSeed ?? new bigDecimal(0);
    value.onWin = function() {
      return points.multiply(points.multiply(value.seed));
    };
    value.onLose = function() {
      return value.loseSeed;
    };
    value.text = `heads: *${value.seed.getPrettyValue()}%; tails: =${value.loseSeed.getPrettyValue()}`;
    return value;
  },
  function(startPoints, seed, loseSeed) {
    var value = {};
    value.prefabId = 7;
    value.seed = seed ?? goodRound(new bigDecimal(Math.random()).multiply(new bigDecimal(1000000))).divide(new bigDecimal(100));
    value.loseSeed = loseSeed ?? new bigDecimal(1);
    value.onWin = function() {
      return points.multiply(new bigDecimal(1).add(this.seed));
    };
    value.onLose = function() {
      return points.multiply(new bigDecimal(1).add(this.loseSeed.negate()));
    };
    value.text = `heads: +${value.seed.multiply(new bigDecimal(100)).getPrettyValue()}%; tails: -${value.loseSeed.multiply(new bigDecimal(100)).getPrettyValue()}%`;
    return value;
  }
];

var options = [];
savedVariable = localStorage.getItem("options");
if (savedVariable === null)
{
  options.push(optionPrefabs[0](points.multiply(new bigDecimal(1))));
  options.push(optionPrefabs[2](points.multiply(new bigDecimal(2))));
} else {
  options = JSON.parse(savedVariable).map(x => optionPrefabs[+x.prefabId](startingPoints, new bigDecimal(x.seed),new bigDecimal(x.loseSeed)));
}
saveState();

function onStart() {
  UpdateVisuals();
}

// function DoFlip() {
//   if (Math.random() <= .5) {points = points.add(new bigDecimal(1)); document.getElementById("resultDiv").innerHTML = "heads"}
//   else {points = points.multiply(loseRatio); document.getElementById("resultDiv").innerHTML = "tails"}
//   UpdateVisuals();
// }

function doOption(id) {
  if (typeof options[+id] === "undefined") return;
  previousPoints = goodRound(points);
  if (Math.random() <= .5) {
    points = options[+id].onWin();
    document.getElementById("resultDiv").innerHTML = "heads"
  } else {
    points = options[+id].onLose();
    document.getElementById("resultDiv").innerHTML = "tails"
  }
  // points=(goodRound(points));
  UpdateVisuals();
//   else {points = points.multiply(loseRatio); document.getElementById("resultDiv").innerHTML = "tails"}
}
function unlockNextOption() {
  var cost = getNextCost();
  if (points.compareTo(cost)<0) return;
  points = points.subtract(cost);
  options.push(optionPrefabs[Math.random()*optionPrefabs.length|0](points.multiply(new bigDecimal(1+options.length**options.length))));
  UpdateVisuals();
}
function UpdateVisuals() {
  var diff = points.subtract(previousPoints);
  document.getElementById("winnnings").innerHTML = (diff.compareTo(new bigDecimal(0)) > 0 ? "+" : "") + goodRound(diff).getPrettyValue();
  document.getElementById("currentPoints").innerHTML =  goodRound(points).getPrettyValue();
  var cost = getNextCost();
  document.getElementById("options").innerHTML = options.map((x,i)=>`<button onclick="doOption('${i}')">${x.text}</button>`).join`
` + `<button ${points.compareTo(cost)<0 ? "disabled " : ""}onclick="unlockNextOption()">Unlock next option for ${cost.getPrettyValue()}</button>`;
  saveState();
  tempLeaderboards = leaderboards.slice(0);
  tempLeaderboards.push([generatedName, points]);
  tempLeaderboards.sort((b,a)=>a[1].compareTo(b[1]));
  document.getElementById("leaderboards").innerHTML = `<div>leaderboards:</div>
`+tempLeaderboards.map((x,i)=>[x[0],x[1],i])
// .filter((x,i)=>x[2]<5 || x[1] == points)
.map((x,i) => `<div${x[1]==points ? ` style="background-color: aliceblue;"` : ""}>${x[2]+1}. ${x[0] + (x[1]==points ? " (you)" : "")}: ${goodRound(x[1]).getPrettyValue()}</div>`).join(``);
}
function getNextCost() {
  return startingPoints.multiply(new bigDecimal((options.length)**(options.length>=4? options.length>=10 ? 6 : 3 : 2)));
}

function bigAbs(bigDecimalNumberToAbs) {
  return bigDecimalNumberToAbs.compareTo(new bigDecimal(0)) < 0 ? bigDecimalNumberToAbs.negate() : bigDecimalNumberToAbs;
}
function goodRound(bigDecimalNumberToRound) {
  if (bigAbs(bigDecimalNumberToRound).compareTo(new bigDecimal(1000000)) >= 0) return bigDecimalNumberToRound.round(-3);
  if (bigAbs(bigDecimalNumberToRound).compareTo(new bigDecimal(100)) >= 0) return bigDecimalNumberToRound.round(-1);
  if (bigAbs(bigDecimalNumberToRound).compareTo(new bigDecimal(10)) >= 0) return bigDecimalNumberToRound.round(2);
  if (bigAbs(bigDecimalNumberToRound).compareTo(new bigDecimal(1)) >= 0) return bigDecimalNumberToRound.round(3);
  if (bigAbs(bigDecimalNumberToRound).compareTo(new bigDecimal(0.1)) >= 0) return bigDecimalNumberToRound.round(10);
  if (bigAbs(bigDecimalNumberToRound).compareTo(new bigDecimal(0.1)) >= 0) return bigDecimalNumberToRound.round(20);
  return bigDecimalNumberToRound.round(5);
}
function saveState() {
  localStorage.setItem("startingPoints", startingPoints.getValue());
  localStorage.setItem("points", points.getValue());
  localStorage.setItem("previousPoints", previousPoints.getValue());
  localStorage.setItem("generatedName", generatedName);
  localStorage.setItem("leaderboardId", leaderboardId);
  localStorage.setItem("options", JSON.stringify(options.map(x=>{return {
    "prefabId" : x.prefabId,
    "seed" : x.seed.getValue(),
    "loseSeed" : x.loseSeed.getValue()
  }})));
}


function httpGetAsync(theUrl, callback) //https://stackoverflow.com/questions/247483/http-get-request-in-javascript
{
    var xmlHttp = new XMLHttpRequest();
    // xmlHttp.setRequestHeader("Origin", )
    xmlHttp.onreadystatechange = function() {
        console.log(xmlHttp);
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
          callback(xmlHttp.responseText);
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function sendScore() {
  // if (leaderboardId == "" && !firstTime) return;//https://docs.google.com/forms/u/3/d/e/1FAIpQLSctn-4nrblqszIcZisvSfXQd72erl1tpDHlgrVpS_4Q2qra6Q/formResponse
  if (lastSentPoints == points) return;
  lastSentPoints = points;
  var url = new URL(`https://docs.google.com/forms/u/3/d/e/1FAIpQLScKWpCbkguNNGrEuzxy9cojir6Zol1O45Xhw4GqaygqeqdCrg/formResponse`);
  if (leaderboardId == "") url.searchParams.append("ups","pp_url");
  else url.searchParams.append("edit2","leaderboardId");
  var pointsStr = goodRound(points).getValue();
  if (pointsStr.length >= 8000 && (points.compareTo(new bigDecimal(100)) > 0 || points.negate().compareTo(new bigDecimal(100)) > 0)) {
    let head = pointsStr.slice(0,7000);
    if (head[0] == "-") head = "-0." + head.slice(1);
    else head = "0." + head;
    pointsStr = head + "e"+pointsStr.length;
  }
  url.searchParams.append("entry.622225149",generatedName);
  url.searchParams.append("entry.611384452",pointsStr);
  url.searchParams.append("entry.1164293687","0");
  // `https://docs.google.com/forms/d/e/1FAIpQLScKWpCbkguNNGrEuzxy9cojir6Zol1O45Xhw4GqaygqeqdCrg/formResponse?${leaderboardId == "" ? "usp=pp_url" :"edit2=" + leaderboardId}&entry.622225149=${generatedName}&entry.611384452=${goodRound(points).getValue()}&entry.1164293687=${0}`
  httpGetAsync(url, responce => {
    console.log(responce);
  });
}
function getLeaderboards() {
  httpGetAsync(`https://docs.google.com/spreadsheets/d/e/2PACX-1vSnVpvnxhcGHYpWiy0n--5ZhFopxLAJ85nm-oTCYWEqDkU_zOjSHxPHto7dMFklWaSNcqFXIGl2-tgJ/pub?gid=844935392&single=true&output=tsv`, responce => {
		leaderboards = responce.split(`\r\n`).slice(1).map(x=>x.split("\t"));
    console.log(leaderboards);
    leaderboards.sort((b,a)=>Date.parse(a[0])-Date.parse(b[0]));
    leaderboards = leaderboards.map(x=>[x[1],new bigDecimal(x[2])]);
    // leaderboards.push([generatedName, points]);
    var names = {};
    leaderboards = leaderboards.filter(function(y, pos) {
      if (!names[y[0]]) {names[y[0]] = 1; return true;}
      return false;
    })
    UpdateVisuals();
  });
}

// function generateName() {
//   return (generatedName = "lopidav");
// }




/*
(c) by Thomas Konings
Random Name Generator for Javascript
*/

function capFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateName(){
var name1 = ["abandoned","able","absolute","adorable","adventurous","academic","acceptable","acclaimed","accomplished","accurate","aching","acidic","acrobatic","active","actual","adept","admirable","admired","adolescent","adorable","adored","advanced","afraid","affectionate","aged","aggravating","aggressive","agile","agitated","agonizing","agreeable","ajar","alarmed","alarming","alert","alienated","alive","all","altruistic","amazing","ambitious","ample","amused","amusing","anchored","ancient","angelic","angry","anguished","animated","annual","another","antique","anxious","any","apprehensive","appropriate","apt","arctic","arid","aromatic","artistic","ashamed","assured","astonishing","athletic","attached","attentive","attractive","austere","authentic","authorized","automatic","avaricious","average","aware","awesome","awful","awkward","babyish","bad","back","baggy","bare","barren","basic","beautiful","belated","beloved","beneficial","better","best","bewitched","big","big-hearted","biodegradable","bite-sized","bitter","black","black-and-white","bland","blank","blaring","bleak","blind","blissful","blond","blue","blushing","bogus","boiling","bold","bony","boring","bossy","both","bouncy","bountiful","bowed","brave","breakable","brief","bright","brilliant","brisk","broken","bronze","brown","bruised","bubbly","bulky","bumpy","buoyant","burdensome","burly","bustling","busy","buttery","buzzing","calculating","calm","candid","canine","capital","carefree","careful","careless","caring","cautious","cavernous","celebrated","charming","cheap","cheerful","cheery","chief","chilly","chubby","circular","classic","clean","clear","clear-cut","clever","close","closed","cloudy","clueless","clumsy","cluttered","coarse","cold","colorful","colorless","colossal","comfortable","common","compassionate","competent","complete","complex","complicated","composed","concerned","concrete","confused","conscious","considerate","constant","content","conventional","cooked","cool","cooperative","coordinated","corny","corrupt","costly","courageous","courteous","crafty","crazy","creamy","creative","creepy","criminal","crisp","critical","crooked","crowded","cruel","crushing","cuddly","cultivated","cultured","cumbersome","curly","curvy","cute","cylindrical","damaged","damp","dangerous","dapper","daring","darling","dark","dazzling","dead","deadly","deafening","dear","dearest","decent","decimal","decisive","deep","defenseless","defensive","defiant","deficient","definite","definitive","delayed","delectable","delicious","delightful","delirious","demanding","dense","dental","dependable","dependent","descriptive","deserted","detailed","determined","devoted","different","difficult","digital","diligent","dim","dimpled","dimwitted","direct","disastrous","discrete","disfigured","disgusting","disloyal","dismal","distant","downright","dreary","dirty","disguised","dishonest","dismal","distant","distinct","distorted","dizzy","dopey","doting","double","downright","drab","drafty","dramatic","dreary","droopy","dry","dual","dull","dutiful","each","eager","earnest","early","easy","easy-going","ecstatic","edible","educated","elaborate","elastic","elated","elderly","electric","elegant","elementary","elliptical","embarrassed","embellished","eminent","emotional","empty","enchanted","enchanting","energetic","enlightened","enormous","enraged","entire","envious","equal","equatorial","essential","esteemed","ethical","euphoric","even","evergreen","everlasting","every","evil","exalted","excellent","exemplary","exhausted","excitable","excited","exciting","exotic","expensive","experienced","expert","extraneous","extroverted","extra-large","extra-small","fabulous","failing","faint","fair","faithful","fake","false","familiar","famous","fancy","fantastic","far","faraway","far-flung","far-off","fast","fat","fatal","fatherly","favorable","favorite","fearful","fearless","feisty","feline","female","feminine","few","fickle","filthy","fine","finished","firm","first","firsthand","fitting","fixed","flaky","flamboyant","flashy","flat","flawed","flawless","flickering","flimsy","flippant","flowery","fluffy","fluid","flustered","focused","fond","foolhardy","foolish","forceful","forked","formal","forsaken","forthright","fortunate","fragrant","frail","frank","frayed","free","French","fresh","frequent","friendly","frightened","frightening","frigid","frilly","frizzy","frivolous","front","frosty","frozen","frugal","fruitful","full","fumbling","functional","funny","fussy","fuzzy","gargantuan","gaseous","general","generous","gentle","genuine","giant","giddy","gigantic","gifted","giving","glamorous","glaring","glass","gleaming","gleeful","glistening","glittering","gloomy","glorious","glossy","glum","golden","good","good-natured","gorgeous","graceful","gracious","grand","grandiose","granular","grateful","grave","gray","great","greedy","green","gregarious","grim","grimy","gripping","grizzled","gross","grotesque","grouchy","grounded","growing","growling","grown","grubby","gruesome","grumpy","guilty","gullible","gummy","hairy","half","handmade","handsome","handy","happy","happy-go-lucky","hard","hard-to-find","harmful","harmless","harmonious","harsh","hasty","hateful","haunting","healthy","heartfelt","hearty","heavenly","heavy","hefty","helpful","helpless","hidden","hideous","high","high-level","hilarious","hoarse","hollow","homely","honest","honorable","honored","hopeful","horrible","hospitable","hot","huge","humble","humiliating","humming","humongous","hungry","hurtful","husky","icky","icy","ideal","idealistic","identical","idle","idiotic","idolized","ignorant","ill","illegal","ill-fated","ill-informed","illiterate","illustrious","imaginary","imaginative","immaculate","immaterial","immediate","immense","impassioned","impeccable","impartial","imperfect","imperturbable","impish","impolite","important","impossible","impractical","impressionable","impressive","improbable","impure","inborn","incomparable","incompatible","incomplete","inconsequential","incredible","indelible","inexperienced","indolent","infamous","infantile","infatuated","inferior","infinite","informal","innocent","insecure","insidious","insignificant","insistent","instructive","insubstantial","intelligent","intent","intentional","interesting","internal","international","intrepid","ironclad","irresponsible","irritating","itchy","jaded","jagged","jam-packed","jaunty","jealous","jittery","joint","jolly","jovial","joyful","joyous","jubilant","judicious","juicy","jumbo","junior","jumpy","juvenile","kaleidoscopic","keen","key","kind","kindhearted","kindly","klutzy","knobby","knotty","knowledgeable","knowing","known","kooky","kosher","lame","lanky","large","last","lasting","late","lavish","lawful","lazy","leading","lean","leafy","left","legal","legitimate","light","lighthearted","likable","likely","limited","limp","limping","linear","lined","liquid","little","live","lively","livid","loathsome","lone","lonely","long","long-term","loose","lopsided","lost","loud","lovable","lovely","loving","low","loyal","lucky","lumbering","luminous","lumpy","lustrous","luxurious","mad","made-up","magnificent","majestic","major","male","mammoth","married","marvelous","masculine","massive","mature","meager","mealy","mean","measly","meaty","medical","mediocre","medium","meek","mellow","melodic","memorable","menacing","merry","messy","metallic","mild","milky","mindless","miniature","minor","minty","miserable","miserly","misguided","misty","mixed","modern","modest","moist","monstrous","monthly","monumental","moral","mortified","motherly","motionless","mountainous","muddy","muffled","multicolored","mundane","murky","mushy","musty","muted","mysterious","naive","narrow","nasty","natural","naughty","nautical","near","neat","necessary","needy","negative","neglected","negligible","neighboring","nervous","new","next","nice","nifty","nimble","nippy","nocturnal","noisy","nonstop","normal","notable","noted","noteworthy","novel","noxious","numb","nutritious","nutty","obedient","obese","oblong","oily","oblong","obvious","occasional","odd","oddball","offbeat","offensive","official","old","old-fashioned","only","open","optimal","optimistic","opulent","orange","orderly","organic","ornate","ornery","ordinary","original","other","our","outlying","outgoing","outlandish","outrageous","outstanding","oval","overcooked","overdue","overjoyed","overlooked","palatable","pale","paltry","parallel","parched","partial","passionate","past","pastel","peaceful","peppery","perfect","perfumed","periodic","perky","personal","pertinent","pesky","pessimistic","petty","phony","physical","piercing","pink","pitiful","plain","plaintive","plastic","playful","pleasant","pleased","pleasing","plump","plush","polished","polite","political","pointed","pointless","poised","poor","popular","portly","posh","positive","possible","potable","powerful","powerless","practical","precious","present","prestigious","pretty","precious","previous","pricey","prickly","primary","prime","pristine","private","prize","probable","productive","profitable","profuse","proper","proud","prudent","punctual","pungent","puny","pure","purple","pushy","putrid","puzzled","puzzling","quaint","qualified","quarrelsome","quarterly","queasy","querulous","questionable","quick","quick-witted","quiet","quintessential","quirky","quixotic","quizzical","radiant","ragged","rapid","rare","rash","raw","recent","reckless","rectangular","ready","real","realistic","reasonable","red","reflecting","regal","regular","reliable","relieved","remarkable","remorseful","remote","repentant","required","respectful","responsible","repulsive","revolving","rewarding","rich","rigid","right","ringed","ripe","roasted","robust","rosy","rotating","rotten","rough","round","rowdy","royal","rubbery","rundown","ruddy","rude","runny","rural","rusty","sad","safe","salty","same","sandy","sane","sarcastic","sardonic","satisfied","scaly","scarce","scared","scary","scented","scholarly","scientific","scornful","scratchy","scrawny","second","secondary","second-hand","secret","self-assured","self-reliant","selfish","sentimental","separate","serene","serious","serpentine","several","severe","shabby","shadowy","shady","shallow","shameful","shameless","sharp","shimmering","shiny","shocked","shocking","shoddy","short","short-term","showy","shrill","shy","sick","silent","silky","silly","silver","similar","simple","simplistic","sinful","single","sizzling","skeletal","skinny","sleepy","slight","slim","slimy","slippery","slow","slushy","small","smart","smoggy","smooth","smug","snappy","snarling","sneaky","sniveling","snoopy","sociable","soft","soggy","solid","somber","some","spherical","sophisticated","sore","sorrowful","soulful","soupy","sour","Spanish","sparkling","sparse","specific","spectacular","speedy","spicy","spiffy","spirited","spiteful","splendid","spotless","spotted","spry","square","squeaky","squiggly","stable","staid","stained","stale","standard","starchy","stark","starry","steep","sticky","stiff","stimulating","stingy","stormy","straight","strange","steel","strict","strident","striking","striped","strong","studious","stunning","stupendous","stupid","sturdy","stylish","subdued","submissive","substantial","subtle","suburban","sudden","sugary","sunny","super","superb","superficial","superior","supportive","sure-footed","surprised","suspicious","svelte","sweaty","sweet","sweltering","swift","sympathetic","tall","talkative","tame","tan","tangible","tart","tasty","tattered","taut","tedious","teeming","tempting","tender","tense","tepid","terrible","terrific","testy","thankful","that","these","thick","thin","third","thirsty","this","thorough","thorny","those","thoughtful","threadbare","thrifty","thunderous","tidy","tight","timely","tinted","tiny","tired","torn","total","tough","traumatic","treasured","tremendous","tragic","trained","tremendous","triangular","tricky","trifling","trim","trivial","troubled","true","trusting","trustworthy","trusty","truthful","tubby","turbulent","twin","ugly","ultimate","unacceptable","unaware","uncomfortable","uncommon","unconscious","understated","unequaled","uneven","unfinished","unfit","unfolded","unfortunate","unhappy","unhealthy","uniform","unimportant","unique","united","unkempt","unknown","unlawful","unlined","unlucky","unnatural","unpleasant","unrealistic","unripe","unruly","unselfish","unsightly","unsteady","unsung","untidy","untimely","untried","untrue","unused","unusual","unwelcome","unwieldy","unwilling","unwitting","unwritten","upbeat","upright","upset","urban","usable","used","useful","useless","utilized","utter","vacant","vague","vain","valid","valuable","vapid","variable","vast","velvety","venerated","vengeful","verifiable","vibrant","vicious","victorious","vigilant","vigorous","villainous","violet","violent","virtual","virtuous","visible","vital","vivacious","vivid","voluminous","wan","warlike","warm","warmhearted","warped","wary","wasteful","watchful","waterlogged","watery","wavy","wealthy","weak","weary","webbed","wee","weekly","weepy","weighty","weird","welcome","well-documented","well-groomed","well-informed","well-lit","well-made","well-off","well-to-do","well-worn","wet","which","whimsical","whirlwind","whispered","white","whole","whopping","wicked","wide","wide-eyed","wiggly","wild","willing","wilted","winding","windy","winged","wiry","wise","witty","wobbly","woeful","wonderful","wooden","woozy","wordy","worldly","worn","worried","worrisome","worse","worst","worthless","worthwhile","worthy","wrathful","wretched","writhing","wrong","wry","yawning","yearly","yellow","yellowish","young","youthful","yummy","zany","zealous","zesty","zigzag","rocky"];

var name2 = ["people","history","way","art","world","information","map","family","government","health","system","computer","meat","year","thanks","music","person","reading","method","data","food","understanding","theory","law","bird","literature","problem","software","control","knowledge","power","ability","economics","love","internet","television","science","library","nature","fact","product","idea","temperature","investment","area","society","activity","story","industry","media","thing","oven","community","definition","safety","quality","development","language","management","player","variety","video","week","security","country","exam","movie","organization","equipment","physics","analysis","policy","series","thought","basis","boyfriend","direction","strategy","technology","army","camera","freedom","paper","environment","child","instance","month","truth","marketing","university","writing","article","department","difference","goal","news","audience","fishing","growth","income","marriage","user","combination","failure","meaning","medicine","philosophy","teacher","communication","night","chemistry","disease","disk","energy","nation","road","role","soup","advertising","location","success","addition","apartment","education","math","moment","painting","politics","attention","decision","event","property","shopping","student","wood","competition","distribution","entertainment","office","population","president","unit","category","cigarette","context","introduction","opportunity","performance","driver","flight","length","magazine","newspaper","relationship","teaching","cell","dealer","debate","finding","lake","member","message","phone","scene","appearance","association","concept","customer","death","discussion","housing","inflation","insurance","mood","woman","advice","blood","effort","expression","importance","opinion","payment","reality","responsibility","situation","skill","statement","wealth","application","city","county","depth","estate","foundation","grandmother","heart","perspective","photo","recipe","studio","topic","collection","depression","imagination","passion","percentage","resource","setting","ad","agency","college","connection","criticism","debt","description","memory","patience","secretary","solution","administration","aspect","attitude","director","personality","psychology","recommendation","response","selection","storage","version","alcohol","argument","complaint","contract","emphasis","highway","loss","membership","possession","preparation","steak","union","agreement","cancer","currency","employment","engineering","entry","interaction","limit","mixture","preference","region","republic","seat","tradition","virus","actor","classroom","delivery","device","difficulty","drama","election","engine","football","guidance","hotel","match","owner","priority","protection","suggestion","tension","variation","anxiety","atmosphere","awareness","bread","climate","comparison","confusion","construction","elevator","emotion","employee","employer","guest","height","leadership","mall","manager","operation","recording","respect","sample","transportation","boring","charity","cousin","disaster","editor","efficiency","excitement","extent","feedback","guitar","homework","leader","mom","outcome","permission","presentation","promotion","reflection","refrigerator","resolution","revenue","session","singer","tennis","basket","bonus","cabinet","childhood","church","clothes","coffee","dinner","drawing","hair","hearing","initiative","judgment","lab","measurement","mode","mud","orange","poetry","police","possibility","procedure","queen","ratio","relation","restaurant","satisfaction","sector","signature","significance","song","tooth","town","vehicle","volume","wife","accident","airport","appointment","arrival","assumption","baseball","chapter","committee","conversation","database","enthusiasm","error","explanation","farmer","gate","girl","hall","historian","hospital","injury","instruction","maintenance","manufacturer","meal","perception","pie","poem","presence","proposal","reception","replacement","revolution","river","son","speech","tea","village","warning","winner","worker","writer","assistance","breath","buyer","chest","chocolate","conclusion","contribution","cookie","courage","desk","drawer","establishment","examination","garbage","grocery","honey","impression","improvement","independence","insect","inspection","inspector","king","ladder","menu","penalty","piano","potato","profession","professor","quantity","reaction","requirement","salad","sister","supermarket","tongue","weakness","wedding","affair","ambition","analyst","apple","assignment","assistant","bathroom","bedroom","beer","birthday","celebration","championship","cheek","client","consequence","departure","diamond","dirt","ear","fortune","friendship","funeral","gene","girlfriend","hat","indication","intention","lady","midnight","negotiation","obligation","passenger","pizza","platform","poet","pollution","recognition","reputation","shirt","speaker","stranger","surgery","sympathy","tale","throat","trainer","uncle","youth","time","work","film","water","money","example","while","business","study","game","life","form","air","day","place","number","part","field","fish","back","process","heat","hand","experience","job","book","end","point","type","home","economy","value","body","market","guide","interest","state","radio","course","company","price","size","card","list","mind","trade","line","care","group","risk","word","fat","force","key","light","training","name","school","top","amount","level","order","practice","research","sense","service","piece","web","boss","sport","fun","house","page","term","test","answer","sound","focus","matter","kind","soil","board","oil","picture","access","garden","range","rate","reason","future","site","demand","exercise","image","case","cause","coast","action","age","bad","boat","record","result","section","building","mouse","cash","class","period","plan","store","tax","side","subject","space","rule","stock","weather","chance","figure","man","model","source","beginning","earth","program","chicken","design","feature","head","material","purpose","question","rock","salt","act","birth","car","dog","object","scale","sun","note","profit","rent","speed","style","war","bank","craft","half","inside","outside","standard","bus","exchange","eye","fire","position","pressure","stress","advantage","benefit","box","frame","issue","step","cycle","face","item","metal","paint","review","room","screen","structure","view","account","ball","discipline","medium","share","balance","bit","black","bottom","choice","gift","impact","machine","shape","tool","wind","address","average","career","culture","morning","pot","sign","table","task","condition","contact","credit","egg","hope","ice","network","north","square","attempt","date","effect","link","post","star","voice","capital","challenge","friend","self","shot","brush","couple","exit","front","function","lack","living","plant","plastic","spot","summer","taste","theme","track","wing","brain","button","click","desire","foot","gas","influence","notice","rain","wall","base","damage","distance","feeling","pair","savings","staff","sugar","target","text","animal","author","budget","discount","file","ground","lesson","minute","officer","phase","reference","register","sky","stage","stick","title","trouble","bowl","bridge","campaign","character","club","edge","evidence","fan","letter","lock","maximum","novel","option","pack","park","quarter","skin","sort","weight","baby","background","carry","dish","factor","fruit","glass","joint","master","muscle","red","strength","traffic","trip","vegetable","appeal","chart","gear","ideal","kitchen","land","log","mother","net","party","principle","relative","sale","season","signal","spirit","street","tree","wave","belt","bench","commission","copy","drop","minimum","path","progress","project","sea","south","status","stuff","ticket","tour","angle","blue","breakfast","confidence","daughter","degree","doctor","dot","dream","duty","essay","father","fee","finance","hour","juice","luck","milk","mouth","peace","pipe","stable","storm","substance","team","trick","afternoon","bat","beach","blank","catch","chain","consideration","cream","crew","detail","gold","interview","kid","mark","mission","pain","pleasure","score","screw","sex","shop","shower","suit","tone","window","agent","band","bath","block","bone","calendar","candidate","cap","coat","contest","corner","court","cup","district","door","east","finger","garage","guarantee","hole","hook","implement","layer","lecture","lie","manner","meeting","nose","parking","partner","profile","rice","routine","schedule","swimming","telephone","tip","winter","airline","bag","battle","bed","bill","bother","cake","code","curve","designer","dimension","dress","ease","emergency","evening","extension","farm","fight","gap","grade","holiday","horror","horse","host","husband","loan","mistake","mountain","nail","noise","occasion","package","patient","pause","phrase","proof","race","relief","sand","sentence","shoulder","smoke","stomach","string","tourist","towel","vacation","west","wheel","wine","arm","aside","associate","bet","blow","border","branch","breast","brother","buddy","bunch","chip","coach","cross","document","draft","dust","expert","floor","god","golf","habit","iron","judge","knife","landscape","league","mail","mess","native","opening","parent","pattern","pin","pool","pound","request","salary","shame","shelter","shoe","silver","tackle","tank","trust","assist","bake","bar","bell","bike","blame","boy","brick","chair","closet","clue","collar","comment","conference","devil","diet","fear","fuel","glove","jacket","lunch","monitor","mortgage","nurse","pace","panic","peak","plane","reward","row","sandwich","shock","spite","spray","surprise","till","transition","weekend","welcome","yard","alarm","bend","bicycle","bite","blind","bottle","cable","candle","clerk","cloud","concert","counter","flower","grandfather","harm","knee","lawyer","leather","load","mirror","neck","pension","plate","purple","ruin","ship","skirt","slice","snow","specialist","stroke","switch","trash","tune","zone","anger","award","bid","bitter","boot","bug","camp","candy","carpet","cat","champion","channel","clock","comfort","cow","crack","engineer","entrance","fault","grass","guy","hell","highlight","incident","island","joke","jury","leg","lip","mate","motor","nerve","passage","pen","pride","priest","prize","promise","resident","resort","ring","roof","rope","sail","scheme","script","sock","station","toe","tower","truck","witness","can","will","other","use","make","good","look","help","go","great","being","still","public","read","keep","start","give","human","local","general","specific","long","play","feel","high","put","common","set","change","simple","past","big","possible","particular","major","personal","current","national","cut","natural","physical","show","try","check","second","call","move","pay","let","increase","single","individual","turn","ask","buy","guard","hold","main","offer","potential","professional","international","travel","cook","alternative","special","working","whole","dance","excuse","cold","commercial","low","purchase","deal","primary","worth","fall","necessary","positive","produce","search","present","spend","talk","creative","tell","cost","drive","green","support","glad","remove","return","run","complex","due","effective","middle","regular","reserve","independent","leave","original","reach","rest","serve","watch","beautiful","charge","active","break","negative","safe","stay","visit","visual","affect","cover","report","rise","walk","white","junior","pick","unique","classic","final","lift","mix","private","stop","teach","western","concern","familiar","fly","official","broad","comfortable","gain","rich","save","stand","young","heavy","lead","listen","valuable","worry","handle","leading","meet","release","sell","finish","normal","press","ride","secret","spread","spring","tough","wait","brown","deep","display","flow","hit","objective","shoot","touch","cancel","chemical","cry","dump","extreme","push","conflict","eat","fill","formal","jump","kick","opposite","pass","pitch","remote","total","treat","vast","abuse","beat","burn","deposit","print","raise","sleep","somewhere","advance","consist","dark","double","draw","equal","fix","hire","internal","join","kill","sensitive","tap","win","attack","claim","constant","drag","drink","guess","minor","pull","raw","soft","solid","wear","weird","wonder","annual","count","dead","doubt","feed","forever","impress","repeat","round","sing","slide","strip","wish","combine","command","dig","divide","equivalent","hang","hunt","initial","march","mention","spiritual","survey","tie","adult","brief","crazy","escape","gather","hate","prior","repair","rough","sad","scratch","sick","strike","employ","external","hurt","illegal","laugh","lay","mobile","nasty","ordinary","respond","royal","senior","split","strain","struggle","swim","train","upper","wash","yellow","convert","crash","dependent","fold","funny","grab","hide","miss","permit","quote","recover","resolve","roll","sink","slip","spare","suspect","sweet","swing","twist","upstairs","usual","abroad","brave","calm","concentrate","estimate","grand","male","mine","prompt","quiet","refuse","regret","reveal","rush","shake","shift","shine","steal","suck","surround","bear","brilliant","dare","dear","delay","drunk","female","hurry","inevitable","invite","kiss","neat","pop","punch","quit","reply","representative","resist","rip","rub","silly","smile","spell","stretch","stupid","tear","temporary","tomorrow","wake","wrap","yesterday","Thomas","Tom","Lieuwe"];

var name = capFirst(name1[getRandomInt(0, name1.length + 1)]) + ' ' + capFirst(name2[getRandomInt(0, name2.length + 1)]);
return name;

}