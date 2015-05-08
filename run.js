/* global currentBoardLength */
/* global currentBoardWidth */
/* global currentBoard */
/* global $ */
/* global WHITE */
/* global GREEN */
/* global RED */


//Set up colors
RED = "rgb(230,0,0)", GREEN = "rgb(0,180,0)", WHITE = "white";

//Set up current board
/*currentBoard = {};
currentBoardWidth = 10;
currentBoardLength = 13;
currentPlayer = GREEN;
for(var i = 0; i < currentBoardWidth; ++i) {
	currentBoard[i] = {};
	for(var j = 0; j < currentBoardLength; ++j) {
		currentBoard[i][j] = {letter:randomLetter(), 
					color:(j===0 ? GREEN : (j===12 ? RED : WHITE))};
	}
}

function randomLetter() {
	return lettersForSampling[Math.floor(Math.random()*lettersForSampling.length)];
}*/

function Space(letter, color) {
	this.letter = letter;
	this.color = color;
	this.flipped = false;
	this.flip = function(val) { //Bool parameter, optional
		if(val !== undefined)
			this.flipped = val;
		else
			this.flipped = !this.flipped;
	};
}

currentBoard = {};
currentBoardWidth = 10, currentBoardLength = 13, currentPlayer = GREEN;

function getBoard() {
	var width = currentBoardWidth, height = currentBoardLength;
	
	function successFunction(data, textStatus, jqXHR) {
		console.log(textStatus);
		console.log(data);
		
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
								(j===0 ? GREEN : 
								(j===height-1 ? RED : WHITE)));
			}
		}
		console.log(currentBoard);
		goPart2();
	}
	
	$.ajax("/", {data: {width:width, height:height, player:0},
						method: "PUT",
						type: "PUT", 
						success: successFunction});
}

//Place for setup that has to be done after page loads
function go() {
//	console.log("Code is running");
	currentBoard = getBoard();
	console.log("Loading...");
}

function goPart2() {
	drawBoard();
	$("body").append('<button id="changePlayer" onclick="changePlayer();">change player</button>');
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
			str+='<text x="'+Math.floor(size*(i+0.2))+'" y="'+ Math.floor(size*(j+0.8))+'" font-size="20px">'+currentBoard[i][j].letter+'</text></g>';
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

//Called when a square is selected
function selectBoggleSquare(i,j) {
	var condition = function(x,y) { return currentBoard[x][y].color === currentPlayer; };
	var action = function(x,y) { var oldColor = currentBoard[i][j].color;
					currentBoard[i][j].color = currentBoard[x][y].color;
					$("#"+makeId(i,j)+" > rect").css("fill", currentBoard[i][j].color);
					if(oldColor !== WHITE && oldColor !== currentPlayer) 
						eraseDetachedPortion(i,j);
				};
	examineNeighbors(i,j,condition,action);
}

function changePlayer() {
	if(currentPlayer === GREEN) {
		currentPlayer = RED;
	} else {
		currentPlayer = GREEN;
	}
}

function erasedDetachedPortion(i,j) {
	var otherPlayer = currentPlayer === GREEN ? RED : GREEN;
	var condition = function(x,y){ return currentBoard[x][y].color === otherPlayer; };
	var action = function(x,y){ if(!isConnected(x,y,otherPlayer)) eraseThread(x,y,otherPlayer); };
	examineNeighbors(i,j,condition,action);
}

//Examines the neighbors of square (i,j). If conditionFunction(x,y) is true, then actionFunction(x,y)
function examineNeighbors(i,j,conditionFunction,actionFunction) {
	for(var x = i-1; x <= i+1; ++x) {
		if(x < 0 || x >= currentBoardWidth) {
			continue;
		} else for(var y = j-1; y <= j+1; ++y) {
			if(y < 0 || y >= currentBoardLength) {
				continue;
			} else if(conditionFunction(x,y)) {
				actionFunction(x,y);
			}
		}
	}
}

function isConnected(i,j,color) {
	var q = new Queue();
	
}

function Queue() {
    var items = [];
    this.push = function(item) {
        items.push(item);                       
    }
    this.pop = function() {
        return items.shift();                                                
    }
    this.peek = function() {
        return items[0];                  
    }
}
