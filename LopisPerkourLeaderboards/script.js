document.addEventListener("DOMContentLoaded", onStart);
var pubTsvURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTwPlhqxhy5MsAAMs38LOe1jMcayb4VpZkIYKZ1sdltek4PnbEWT7r5AsbuzLZYb0Wd4iXd1_gnEALf/pub?gid=1664204216&single=true&output=tsv`;
var leaderboards = [];

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
  sortLeaderboardsBy();
  console.log(leaderboards);
  displayLeaderboards()
});

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
  <tr>
    <td>${x.date.toLocaleString()}</td>
    <td>${x.steamName}</td>
    <td>${x.map}</td>
    <td>${x.time}</td>
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