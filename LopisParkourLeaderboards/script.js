document.addEventListener("DOMContentLoaded", onStart);
var pubTsvURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTwPlhqxhy5MsAAMs38LOe1jMcayb4VpZkIYKZ1sdltek4PnbEWT7r5AsbuzLZYb0Wd4iXd1_gnEALf/pub?gid=1664204216&single=true&output=tsv`;
var leaderboards = [];
var placementSortedLeaderboards = [];
class Record {
  constructor(dateString, steamId, steamName, map, timeString) {
    this.date = new Date(dateString);
    this.steamId = steamId;
    this.steamName = steamName;

    this.mapId = map;
    this.time = +timeString.replace(/[.,]/g,"");
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
    let mapAll = this.mapId.split`\\`;
    if (!mapAll[1]) {this._mapNumber = Infinity;this._mapName = this.mapId;this._packAuthor="";this._packName="";}
    [this._packAuthor, this._packName]= mapAll[0].split`_`;
    if (!this._packName) this._packName = mapAll[0];
    this._packName = this._packName.replace(/_/gi, " ");
    this._mapName = mapAll[1].replace(/(^prk_|\.map$)/gmi,"").replace(/_/gi," ");
  } 
};

httpGetAsync(pubTsvURL, responce => {
  leaderboards = responce.split("\r\n").map(x=>x.split("\t")).slice(1).map(x=>new Record(x[0],x[1],x[2],x[3],x[4]));
  processPlacing();
  sortLeaderboardsBy();
  console.log(leaderboards);
  displayLeaderboards()
});

function processPlacing()
{
  placementSortedLeaderboards = leaderboards.slice(0);
  placementSortedLeaderboards.sort((a,b)=>a.time-b.time).sort((a,b)=>a.mapId == b.mapId ? 0 : a.mapId > b.mapId ? 1 : -1)
  let i = 1;
  let prevMap = "";
  placementSortedLeaderboards.forEach(x => {
    if (x.mapId != prevMap) {i = 1;prevMap = x.mapId;};
    x.placement = i;
    i++;
  })
  // leaderboards = placementSortedLeaderboards;
}
function sortLeaderboardsBy(byWhat) {
  switch(byWhat){
    case "date":
    default:
      leaderboards.sort((x,y)=>y.date-x.date)
      break;
  }
}

function displayLeaderboards() {
  document.getElementById("mainTable").innerHTML = leaderboards.map(x=>`
  <tr style="background-color:${x.placement == 1 ? `#ffd900` : x.placement == 2 ? `#ffd90077` : x.placement == 3 ? `#ffd90025` : `initial`};" >
    <td>${x.mapName}</td>
    <td>${x.placement}</td>
    <td>${x.steamName}</td>
    <td>${x.time}</td>
    <td>${x.date.toLocaleString()}</td>
  </tr>`).join`
`;
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