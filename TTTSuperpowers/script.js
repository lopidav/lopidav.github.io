document.addEventListener("DOMContentLoaded", onStart);


var gameState = {};

function onStart() {
  gameState.currBoard = [];

  gameState.whosTurn = "X";
  
  fullResetBoard(gameState.currBoard);
  displayBoard(gameState.currBoard);
}
class boardCell {
  constructor(value)
  {
    this.text = value == -1 || value == 0 ? "" : 0;
    this.clickable = value == 0;
    this.isNonBoard = value == -1 ;
  }
  html(rowId, cellId) {
    return `<td class="${this.isNonBoard ? "nonBoard" : this.clickable ? "clickable" : "empty"}">` +(this.clickable? `<button onclick=cellClicked(${rowId},${cellId})>`:"") + this.text + (this.clickable? `</button>`:"") + "</td>";
  }
  fill(text, clickable) {
    this.text = text;
    this.clickable = clickable;
  }
}
function cellClicked(rowId,cellId) {
  console.log(rowId, cellId);
  gameState.currBoard[rowId][cellId].fill(gameState.whosTurn)
  gameState.whosTurn = gameState.whosTurn == "X" ? "O" : "X";
  displayBoard(gameState.currBoard);
}
function displayBoard(board) {
  let table = document.getElementById("mainTable");
  table.innerHTML = 
    board.map((row,rowId)=>"<tr>"+
      row.map((cell,cellId)=>cell.html(rowId,cellId)).join``
      + "</tr>"
    ).join`
`;
}

function fullResetBoard(board) {
  gameState.whosTurn = "X";
  board.length = 0;
  for (let i = 0; i < 5; i++) {
    var row = [];
    for (let j = 0; j < 5; j++) row.push(new boardCell( i>0 && i<4 && j>0 && j<4 ? 0 : -1));
    board.push(row);
  }
  return board;
}
function WinCheck(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) row.push(new boardCell( i>0 && i<4 && j>0 && j<4 ? 0 : -1));
    board.push(row);
  }
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
