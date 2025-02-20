document.addEventListener("DOMContentLoaded", onStart);
var pubTsvURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTwPlhqxhy5MsAAMs38LOe1jMcayb4VpZkIYKZ1sdltek4PnbEWT7r5AsbuzLZYb0Wd4iXd1_gnEALf/pub?gid=1664204216&single=true&output=tsv`;
var leaderboards = [];
var fullLeaderboards = [];
var placementSortedLeaderboards = [];
var params = new URLSearchParams(window.location.search);
class Record {
  constructor(dateString, steamId, steamName, map, timeString, realDateString) {
    this.date = new Date(!realDateString ? dateString : realDateString);
    this.steamId = steamId;
    this.steamName = steamName.replace(/<.+?>/g,"");
    this.mapId = map;
    this.timeMs = +timeString.replace(/[.,]/g,"");
  }
  get time() {
    let temp = new Date(0);
    temp.setMilliseconds(this.timeMs);
    if (this.timeMs > 60*60*1000) return temp.toISOString().substring(11, 23);
    return temp.toISOString().substring(14, 23);
  }
  get mapNumber() {
    if (typeof this._mapNumber !== 'undefined') return this._mapNumber;
    this._mapNumber = +/\\prk_(.*?)_/gi.exec()[1];
    if (isNaN(this._mapNumber)) this._mapNumber = Infinity;
    return this._mapNumber;
  }
  get mapName() {
    if (typeof this._mapName !== 'undefined') return this._mapName;
    this.processMapName();
    return this._mapName;
  }
  get packAuthor() {
    if (typeof this._packAuthor !== 'undefined') return this._packAuthor;
    this.processMapName();
    return this._packAuthor;
  }
  get packName() {
    if (typeof this._packName !== 'undefined') return this._packName;
    this.processMapName();
    return this._packName;
  }
  processMapName() {
    if (typeof this.mapId === 'undefined') return;
    if (this.mapId == "") return;
    let mapAll = this.mapId.split`\\`;
    if (!mapAll[1]) {this._mapNumber = Infinity;this._mapName = this.mapId;this._packAuthor="";this._packName="";}
    [this._packAuthor, this._packName]= mapAll[0].split`_`;
    if (!this._packName) this._packName = mapAll[0];
    this._packName = this._packName.replace(/_/gi, " ");
    this._mapName = mapAll[1].replace(/(^prk_|\.map$)/gmi,"").replace(/_/gi," ");
  }
  isValid() {
    if (typeof this.mapId === 'undefined') return false;
    if (this.mapId == "") return false;
    if (typeof this.timeMs === 'undefined') return false;
    if (Number.isNaN(this.timeMs)) return false;
    if (this.timeMs <= 0) return false;
    if (typeof this.steamId === 'undefined') return false;
    if (this.steamId == "") return false;
    if (typeof this.steamName === 'undefined') return false;
    if (this.steamName == "") return false;
    return true;
  } 
};

httpGetAsync(pubTsvURL, responce => {
  leaderboards = responce.split("\r\n").map(x=>x.split("\t")).slice(1).map(x=>new Record(...x)).filter(x=>x.isValid());
  removeDuplicats();
  processPlacing();
  sortLeaderboardsBy();
  fullLeaderboards = leaderboards.slice(0);
  // console.log(leaderboards);
  filterLeaderboards()
  displayLeaderboards()
});
function removeDuplicats() {
  var seen = {};
  leaderboards.sort((a,b)=>a.timeMs-b.timeMs);
  leaderboards =  leaderboards.filter(x =>seen.hasOwnProperty(x.mapId + x.steamId) ? false : (seen[x.mapId + x.steamId] = true));
}

function processPlacing()
{
  placementSortedLeaderboards = leaderboards.slice(0);
  placementSortedLeaderboards.sort((a,b)=>a.timeMs-b.timeMs).sort((a,b)=>a.mapId == b.mapId ? 0 : a.mapId > b.mapId ? 1 : -1)
  let i = 1;
  let prevMap = "";
  placementSortedLeaderboards.forEach(x => {
    if (x.mapId != prevMap) {i = 1;prevMap = x.mapId;};
    x.placement = i;
    i++;
  })
  // leaderboards = placementSortedLeaderboards;
}
function textCompare(a,b) {
  return a == b ? 0 : a > b ? 1 : -1;
}
function sortLeaderboardsBy(byWhat) {
  if (byWhat) {
    params.set("sortBy",  byWhat);
    history.pushState({params:params.toString()},"true", "?" + params.toString());
  } else if (params.get("sortBy")) byWhat = params.get("sortBy");
  switch(byWhat){
    case "steamName":
      leaderboards.sort((a,b)=>textCompare(a.steamName,b.steamName));
      break;
    case "placement":
      leaderboards.sort((a,b)=>a.placement-b.placement);
      break;
    case "mapId":
      leaderboards.sort((a,b)=>textCompare(a.mapId,b.mapId))
      break;
    case "mapName":
      leaderboards
        .sort((a,b)=>textCompare(a.mapName,b.mapName))
        .sort((a,b)=>a.mapNumber-b.mapNumber)
        .sort((a,b)=>textCompare(a.packName,b.packName))
        .sort((a,b)=>textCompare(a.packAuthor,b.packAuthor))
      break;
    case "time":
      leaderboards.sort((a,b)=>a.timeMs-b.timeMs);
      break;
    case "date":
    default:
      if (params.get("mapId")) leaderboards.sort((a,b)=>a.timeMs-b.timeMs);
      else leaderboards.sort((x,y)=>y.date-x.date);
      break;
  }
}
function filterLeaderboardsByOneField(byWhat, value) {
  leaderboards = fullLeaderboards.slice(0);
  params = new URLSearchParams();
  params.set(byWhat, value);
  history.pushState({params:params.toString()},"true", "?" +params.toString());
  filterLeaderboards();
  sortLeaderboardsBy();
  displayLeaderboards();
}
function filterLeaderboards() {
  params.forEach((value, byWhat) => {
    switch(byWhat){
      case "steamId":
        leaderboards = leaderboards.filter(x=>x.steamId == value);
        break;
      case "mapId":
        leaderboards = leaderboards.filter(x=>x.mapId == value);
        break;
    }
  });

}
function displayLeaderboards() {

  var mainTable = document.getElementById("mainTable");
  mainTable.innerHTML = "";
  // mainTable.appendChild(document.createElement('tbody'))

  leaderboards.forEach(x=>{
    let row = document.createElement('tr');
    row.style.backgroundColor = x.placement == 1 ? `#ffd900` : x.placement == 2 ? `#ffd90077` : x.placement == 3 ? `#ffd90025` : `initial`;
    mainTable.appendChild(row);
    row.appendChild(document.createElement('td')).innerText = x.placement;
    
    let steamNameButton = document.createElement('button');
    steamNameButton.innerText = x.steamName;
    steamNameButton.addEventListener('click', function(){
      filterLeaderboardsByOneField("steamId", x.steamId);
    });

    let temp = document.createElement('td');
    temp.appendChild(steamNameButton);
    row.appendChild(temp)

    row.appendChild(document.createElement('td')).innerText = x.time;

    let mapNameButton = document.createElement('button');
    mapNameButton.innerText = x.mapName;
    mapNameButton.addEventListener('click', function(){
      filterLeaderboardsByOneField("mapId", x.mapId);
    });

    temp = document.createElement('td');
    temp.appendChild(mapNameButton);
    row.appendChild(temp);
    
    row.appendChild(document.createElement('td')).innerText = x.date.toLocaleString();
  });
}
function onStart() {
  displayLeaderboards();
}
function httpGetAsync(theUrl, callback) //https://stackoverflow.com/questions/247483/http-get-request-in-javascript
{
    var xmlHttp = new XMLHttpRequest();
    // xmlHttp.setRequestHeader("Origin", )
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

window.onpopstate = function(event) {
  leaderboards = fullLeaderboards.slice(0);
  if (event.state && event.state.params) {
    params = new URLSearchParams(event.state.params);
  }
  else {
    params = new URLSearchParams(window.location.search);
  }
  sortLeaderboardsBy();
  filterLeaderboards();
  displayLeaderboards();
};