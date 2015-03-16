//Set up letter selection system
frequencies = {"a":82,"b":15,"c":28,"d":43,"e":127,"f":22,"g":20,"h":61,"i":70,"j":2,"k":8,"l":40,"m":24,"n":67,"o":75,"p":19,"q":1,"r":60,"s":63,"t":91,"u":28,"v":10,"w":24,"x":2,"y":20,"z":1}
letters = [];
for(var letter in frequencies){
	for(var i = 0; i < frequencies[letter]; i++) {
		letters.push(letter);
	}
}

//Set up colors
RED = "rgb(230,0,0)", GREEN = "rgb(0,180,0)", WHITE = "white";

//Create a board space
function Space(color) {
	this.letter = letters[Math.floor(Math.random()*letters.length)];
	this.color = color;
}

//Set up current board
function Board(width, length, player) {
	this.width = width;
	this.length = length;
	this.currentPlayer = player;
	for(var i = 0; i < width; ++i) {
		this[i] = {"-1":null};
		if(!this[i]) {
			alert("waht.");
		}
	} for(var j = 0; j < length; ++j) {
		if(!this[i]) {
			alert("ERROR");
			return;
		}
		this[i][j] = new Space(j===0 ? GREEN : (j===12 ? RED : WHITE));
	}
}


//Place for setup that has to be done after page loads
function go() {
	console.log("Code is running");
	drawBoard(new Board(10,13,GREEN));
	$("body").append('<button id="changePlayer" onclick="changePlayer();">change player</button>');
}

//Draws the board
function drawBoard(currentBoard) {
	var size = 30;
	var str = '<svg id="svg" width="'+currentBoard.width*size+'" height="'+currentBoard.length*size+'">';
	for(var i = 0; i < currentBoard.width; i++) {
		for(var j = 0; j < currentBoard.length; j++) {
			str+='<g id="'+makeId(i,j)+'">';
			str+='<rect x="'+size*i+'" y="'+size*j;
			str+='" width ="'+size+'" height="'+size;
			str+='" style="fill:'+currentBoard[i][j].color;
			str+=';stroke:black;" ';
			str+='onclick="selectBoggleSquare('+i+','+j+');"></rect>';
			str+='<text x="'+Math.floor(size*(i+0.2))+'" y="'+ Math.floor(size*(j+0.8))+'" font-size="20px" onclick="selectBoggleSquare('+i+','+j+');">'+currentBoard[i][j].letter+'</text></g>'
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

function eraseDetachedPortion(i,j) {
	console.log("erasing segment");
	//Determine who the other player is
	var otherPlayer = currentPlayer === GREEN ? RED : GREEN;
	var condition = function(x,y){ return currentBoard[x][y].color === otherPlayer; };
	var action = function(x,y){ if(!isConnected(x,y,otherPlayer)) eraseThread(x,y,otherPlayer); };
	examineNeighbors(i,j,condition,action);
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
	var q = [];
	q.push({i:i,j:j});
	while(q.length > 0) {
		for(var x = i-1; x <= i+1; ++x) {
			if(x < 0 || x >= currentBoardWidth) {
				continue;
			} else for(var y = j-1; y <= j+1; ++y) {
				if(y <= 0 || y >= currentBoardLength || x === y) {
					continue;
				}  else if(currentBoard[x][y].color === color) {
					if((y === 0 && color === GREEN) || (y === currentBoardLength-1 && color === RED)) {
						return true;
					}
					q.push({i:x, j:y});
				}
			}
		}
	} 
/*	var condition = function(x,y) { return currentBoard[x][y].color == color; };
	var action = function(x,y) { }
	var folder = function(a,b) { return a || b; }
*/
}

function eraseThread(i,j,color) {
	var condition = function(x,y) { return currentBoard[x][y].color === color; };
	var action = function(x,y) { currentBoard[x][y].color = WHITE; eraseThread(x,y,color); };
	examineNeighbors(i,j,condition,action);
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
    this.isEmpty = function() {
	return items.length == 0;
    }
}
