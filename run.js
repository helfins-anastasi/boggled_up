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
function Space(letter, color, x, y) {
	this.letter = letter;
	this.color = color;
	this.x = x;
	this.y = y;
	this.flipped = false;
	this.flip = function(val) { //Bool parameter, optional (if undefined, flipped is toggled and color is assigned based on colorTransform[currentPlayer])
		if(val !== undefined) {
			this.flipped = val != WHITE;
			this.color = val;	
		} else {
			this.flipped = !this.flipped;
			if(this.color == WHITE) {
				this.color = brighten[colorTransform[currentPlayer]];
			} else {
				this.color = WHITE;
			}
		}
		return this.color != WHITE;
	};
	this.redraw = function() {
		$("#"+makeId(this.x,this.y)+" > rect").css("fill", this.color);
	}
}

currentBoard = {};
currentBoardWidth = 10, currentBoardLength = 13, currentPlayer = 0;
currentMove = [];
colorTransform = {};
colorTransform[0] = GREEN;
colorTransform[currentBoardLength-1] = RED;
brighten = {};
brighten[GREEN] = BRIGHT_GREEN;
brighten[RED] = BRIGHT_RED;
darken = {};
darken[BRIGHT_GREEN] = GREEN;
darken[BRIGHT_RED] = RED;

//player = {GREEN:0, RED:(currentBoardLength-1)};

function getBoard() {
	var width = currentBoardWidth, height = currentBoardLength;
	
	function successFunction(data, textStatus, jqXHR) {		
		data = JSON.parse(data);
		
		for(var i = 0; i < width; i++) {
		//for(var i in data) {
			if(!data[i]) {
				console.log("data["+i+"] DNE");
				continue;
			}
			if(currentBoard == undefined)
				currentBoard = {};
			currentBoard[i] = {};
			
			for(var j = 0; j < height; j++) {
			//for(var j in data) {
				if(!data[i][j]) {
					console.log("data["+i+"]["+j+"] DNE");
				}
				currentBoard[i][j] = new Space(data[i][j], 
								(j===0 ? GREEN : (j===height-1 ? RED : WHITE)),
								i,j);
			}
		}
		goPart2();
	}
	
	$.ajax("/", {data: {width:width, height:height, player:0},
						method: "PUT",
						type: "PUT", 
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
	var str = '<svg id="svg" width="'+10*size+'" height="'+13*size+'">';
	for(var i = 0; i < 10; i++) {
		for(var j = 0; j < 13; j++) {
			str+='<g id="'+makeId(i,j)+'">';
			str+='<rect x="'+size*i+'" y="'+size*j;
			str+='" width ="'+size+'" height="'+size;
			str+='" style="fill:'+currentBoard[i][j].color;
			str+=';stroke:black;" ';
			str+='onclick="selectBoggleSquare('+i+','+j+');"></rect>';			     
			str+='<text x="'+Math.floor(size*(i+0.2))+'" y="'+ Math.floor(size*(j+0.8))+'" font-size="20px" ';
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
		if(x < 0 || x >= currentBoardWidth) {
			continue;
		} else for(var y = j-1; y <= j+1; ++y) {
			if(y < 0 || y >= currentBoardLength) {
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
		if(popped.y != currentPlayer) {
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
		if(currentBoard[i][j].color == colorTransform[currentPlayer]) {
			selectSpace(i,j);
			currentBoard[i][j].flip(brighten[colorTransform[currentPlayer]]);
			currentBoard[i][j].redraw();
		}
		return;
	}
	//In the case we select something in our start
	if(j == currentPlayer) {
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
	} else if(currentBoard[i][j].color == colorTransform[currentPlayer]) { 
		//If we select something not in our start that is also our color
		unselect(i,j);
		return;
	}
	
	
	var conditionFunction = function(x,y) { 
		return x === currentMove[currentMove.length-1].x && 
				y === currentMove[currentMove.length-1].y; 
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
		console.log(data);
		changePlayer();
	}
	var dataObj = {};
	dataObj["moves"] = JSON.stringify(encodeMove(currentMove));
	console.log(dataObj["moves"]);
	dataObj["player"] = currentPlayer;
	$.ajax("/move", {data: dataObj, method: "PUT",
						type: "PUT", 
						success: successFunction});
}