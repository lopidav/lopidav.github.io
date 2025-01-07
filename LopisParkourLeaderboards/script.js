document.addEventListener("DOMContentLoaded", onStart);
var pubTsvURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTwPlhqxhy5MsAAMs38LOe1jMcayb4VpZkIYKZ1sdltek4PnbEWT7r5AsbuzLZYb0Wd4iXd1_gnEALf/pub?gid=1664204216&single=true&output=tsv`;
var leaderboards = [];
var placementSortedLeaderboards = [];
class Record {
  constructor(dateString, steamId, steamName, map, timeString) {
    this.date = new Date(dateString);
    this.steamId = steamId;
    this.steamName = steamName;
    this.map = map;
    this.time = +timeString.replace(/[.,]/g,"");
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
  placementSortedLeaderboards.sort((a,b)=>a.time-b.time).sort((a,b)=>a.map == b.map ? 0 : a.map > b.map ? 1 : -1)
  var i = 1;
  var prevMap = "";
  placementSortedLeaderboards.forEach(x => {
    if (x.map != prevMap) {i = 1;prevMap = x.map;};
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
    <td>${x.date.toLocaleString()}</td>
    <td>${x.steamName}</td>
    <td>${x.map}</td>
    <td>${x.time}</td>
    <td>${x.placement}</td>
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