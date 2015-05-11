/* global player */
/* global currentBoardId */
/* global darken */
/* global brighten */
/* global BRIGHT_GREEN */
/* global BRIGHT_RED */
/* global colorTransform */
/* global currentMove */
/* global currentPlayer */
/* global color */
/* global currentBoardLength */
/* global currentBoardWidth */
/* global currentBoard */
/* global $ */
/* global WHITE */
/* global GREEN */
/* global RED */


//Set up colors
RED = "rgb(230,0,0)", GREEN = "rgb(0,180,0)", WHITE = "white";
//Also brighter versions for when the square is selected
BRIGHT_RED = "rgb(255, 0, 0)", BRIGHT_GREEN = "rgb(0,230,0)";

//A class for each space
function Space(letter, player, x, y) {
	this.letter = letter;
	this.player = player;
	this.setPlayer = function(val) {
		this.player = val;
		this.color = colorTransform[val];
	}
	this.color = colorTransform[player];
	this.x = x;
	this.y = y;
	this.flipped = false;
	this.flip = function(val) { //Bool parameter, optional (if undefined, flipped is toggled and color is assigned based on colorTransform[currentPlayer])
		if(val !== undefined) {
			this.flipped = val != WHITE;
			this.color = val;
			this.player = player[val];
		} else {
			this.flipped = !this.flipped;
			if(this.color == WHITE) {
				this.color = brighten[colorTransform[currentPlayer]];
				this.player = currentPlayer;
			} else {
				this.color = WHITE;
				this.player = player[WHITE];
			}
		}
		return this.color != WHITE;
	};
	this.redraw = function() {
		$("#"+makeId(this.x,this.y)+" > rect").css("fill", this.color);
	}
}

currentBoard = {};
currentBoardId = undefined;
currentBoardWidth = 10, currentBoardLength = 13, currentPlayer = 0;
currentMove = [];

colorTransform = {};
colorTransform[-1] = WHITE;
colorTransform[0] = GREEN;
colorTransform[currentBoardLength-1] = RED;

brighten = {};
brighten[GREEN] = BRIGHT_GREEN;
brighten[RED] = BRIGHT_RED;

darken = {};
darken[BRIGHT_GREEN] = GREEN;
darken[BRIGHT_RED] = RED;

player = {};
player[WHITE] = -1;
player[GREEN] = 0;
player[BRIGHT_GREEN] = 0;
player[RED] = currentBoardLength - 1;
player[BRIGHT_RED] = currentBoardLength - 1;


function getBoard(id) { //Optional parameter, if undefined then get a new board
	function successFunction(data, textStatus, jqXHR) {
		data = JSON.parse(data);
		
		currentBoardId = data['id'];
		var tempBoard = data['board'];
		
		for(var i = 0; i < currentBoardLength; i++) {
			if(!tempBoard[i]) { console.log("tempBoard["+i+"] DNE"); continue; }
			if(currentBoard == undefined) currentBoard = {};
			
			currentBoard[i] = {};
			for(var j = 0; j < currentBoardWidth; j++) {
				if(!tempBoard[i][j]) { console.log("tempBoard["+i+"]["+j+"] DNE"); continue; }
				
				currentBoard[i][j] = new Space(tempBoard[i][j]["letter"], 
								tempBoard[i][j]["player"],
								i,j);
			}
		}
		goPart2();
	}
	
	var dataObj = {};
	if(id) {
		dataObj.type = "refresh";
		dataObj.id = id;
	} else {
		dataObj.type = "new";	
		dataObj.width = currentBoardWidth;
		dataObj.height = currentBoardLength;
	}
	
	$.ajax("/", {data: dataObj, method: "PUT", type: "PUT", 
					success: successFunction});
}

//Place for setup that has to be done after page loads
function go() {
	currentBoard = getBoard();
	console.log("Loading...");
}

function goPart2() {
	drawBoard();
	$("body").append('<p id="selectedWord" style="font:20px bold;display:inline;margin:-200px 20px 0 20px;"> </p>')
	$("body").append('<button id="submitMove" onclick="submitMove();">Submit Move!</button>');
}

function removeLetter(letter) {
	var currentText = $("#selectedWord")[0].innerHTML;
	if(letter == currentText.substr(currentText.length-1)) {
		$("#selectedWord")[0].innerHTML = currentText.substring(0, currentText.length-1);
	} else {
		alert("Whoa, the internal state is DEFINITELY wrong. Try reloading?");
	}
}

function addLetter(letter) {
	$("#selectedWord")[0].innerHTML += letter;
}

//Draws the board
function drawBoard() {
	var size = 30;
	var str = '<svg id="svg" width="'+currentBoardWidth*size+'" height="'+currentBoardLength*size+'">';
	for(var i = 0; i < currentBoardLength; i++) {
		for(var j = 0; j < currentBoardWidth; j++) {
			str+='<g id="'+makeId(i,j)+'">';
			str+='<rect x="'+size*j+'" y="'+size*i;
			str+='" width ="'+size+'" height="'+size;
			str+='" style="fill:'+currentBoard[i][j].color;
			str+=';stroke:black;" ';
			str+='onclick="selectBoggleSquare('+i+','+j+');"></rect>';			     
			str+='<text x="'+Math.floor(size*(j+0.2))+'" y="'+ Math.floor(size*(i+0.8))+'" font-size="20px" ';
			str+='onclick="selectBoggleSquare('+i+','+j+');">'+currentBoard[i][j].letter+'</text></g>';
		str+="</g>";
		}
	}
	str += '</svg>';
	$("body").append(str);
}

//Abstracts the id for each square to just its index
function makeId(i,j) {
	return "space"+i+"_"+j;
}

//Examines the eight neighbors of square (i,j). 
//	If conditionFunction(x,y) is true, then actionFunction(x,y). 
//	If actionFunction(x,y) returns a truthy value, then the function exits.
function examineNeighbors(i,j,conditionFunction,actionFunction) {
	for(var x = i-1; x <= i+1; ++x) {
		if(x < 0 || x >= currentBoardLength) {
			continue;
		} else for(var y = j-1; y <= j+1; ++y) {
			if(y < 0 || y >= currentBoardWidth) {
				continue;
			} else if(conditionFunction(x,y)) {
				if(actionFunction(x,y)) return;
			} 
		}
	}
}

function unselect(i,j) {
	while(currentMove.length > 0) {
		var popped = currentMove.pop();
		if(popped.x != currentPlayer) {
			popped.flip(WHITE);
		} else {
			popped.flip(colorTransform[currentPlayer]);
		}
		popped.redraw();
		removeLetter(popped.letter);
		if(popped == currentBoard[i][j]) break;
	}
}

function selectSpace(i,j) {
	currentMove.push(currentBoard[i][j]);
	addLetter(currentBoard[i][j].letter);
}

function selectBoggleSquare(i,j) {
	//In the case that we have no move yet
	if(currentMove.length == 0) {
		//If the selected square is our color, start the move
		if(currentBoard[i][j].player == currentPlayer) {
			selectSpace(i,j);
			currentBoard[i][j].flip(brighten[colorTransform[currentPlayer]]);
			currentBoard[i][j].redraw();
		}
		return;
	}
	//In the case we select something in our start
	if(i == currentPlayer) {
		//If it's in the move
		if($.inArray(currentBoard[i][j], currentMove) >= 0) {
			unselect(i,j);
			
			//If it's within one space
		} else if(Math.abs(currentMove[currentMove.length-1].x - i) <= 1 
				&& Math.abs(currentMove[currentMove.length-1].y - j) <= 1) { //In both directions
			selectSpace(i,j);
			currentBoard[i][j].flip(brighten[colorTransform[currentPlayer]]);
			currentBoard[i][j].redraw();
		}
		return;
	} else if(currentBoard[i][j].player == currentPlayer) { 
		//If we select something not in our start that is also our color
		unselect(i,j);
		return;
	}
	
	
	var conditionFunction = function(x,y) {
		var result = (x === currentMove[currentMove.length-1].x && 
					y === currentMove[currentMove.length-1].y); 
		return result;
	}
	
	var actionFunction = function(x,y) { 
		if(currentBoard[i][j].flip()) { //If space was not made white
			selectSpace(i,j);
		} else { //If space is now white
			unselect(i,j);
		}
		currentBoard[i][j].redraw(); //Update the visible color 
		return true;
	};
	examineNeighbors(i,j,conditionFunction, actionFunction);
}

function changePlayer() {
	currentMove = [];
	$("#selectedWord")[0].innerHTML = "";
	if(currentPlayer === 0) {
		currentPlayer = currentBoardLength-1;
	} else {
		currentPlayer = 0;
	}
}

function encodeMove(moveList) {
	var result = [];
	for(var i in moveList) {
		var mv = moveList[i];
		result.push(mv.x);
		result.push(mv.y);
		result.push(mv.letter);
		//var item = {x:mv.x, y:mv.y, index:i, char:mv.letter};
		//result.push(item);
	}
	return result;
}

function submitMove() {
	function successFunction(data, textStatus, jqXHR) {
		data = JSON.parse(data);
		if(data.status == "failed") {
			alert("We're sorry, something has gone wrong. Please reload the page.");
			return;
		}
		data.changes = JSON.parse(data.changes);
		for(var i in data.changes) {
			var x = data.changes[i].x;
			var y = data.changes[i].y;
			var letter = data.changes[i].letter;
			var player = data.changes[i].player;
			if(currentBoard[x][y].letter !== letter) {
				alert("Whoa, the internal state is DEFINITELY wrong. Try reloading?");
				return;
			}
			//#################### FINISH THIS
			currentBoard[x][y].setPlayer(player);
			currentBoard[x][y].redraw();
		}
		changePlayer();
	}
	var dataObj = {};
	dataObj["moves"] = JSON.stringify(encodeMove(currentMove));
	dataObj["player"] = currentPlayer;
	dataObj["id"] = currentBoardId;
	$.ajax("/move", {data: dataObj, method: "PUT",
						type: "PUT", 
						success: successFunction});
}