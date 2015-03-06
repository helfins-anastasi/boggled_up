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

//Set up current board
currentBoard = {};
currentBoardWidth = 10;
currentBoardLength = 13;
currentPlayer = GREEN;
for(var i = 0; i < currentBoardWidth; ++i) {
	currentBoard[i] = {};
	for(var j = 0; j < currentBoardLength; ++j) {
		currentBoard[i][j] = {letter:letters[Math.floor(Math.random()*letters.length)], 
					color:(j===0 ? GREEN : (j===12 ? RED : WHITE))};
	}
}

//Place for setup that has to be done after page loads
function go() {
	console.log("Code is running");
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
			str+='<text x="'+Math.floor(size*(i+0.2))+'" y="'+ Math.floor(size*(j+0.8))+'" font-size="20px">'+currentBoard[i][j].letter+'</text></g>'
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
	console.log("Clicked on square "+i+", "+j);
	for(var x = i-1; x <= i+1; ++x) {
		if(x < 0 || x >= currentBoardWidth) {
			console.log("Past right/left side of board");
			continue;
		} else for(var y = j-1; y <= j+1; ++y) {
			console.log("examining space ("+x+", "+y+")");
			if(y < 0 || y >= currentBoardLength) {
				console.log("Past top/bottom of board");
				continue;
			}
			if(currentBoard[x][y].color === currentPlayer) {
				var oldColor = currentBoard[i][j].color;
				currentBoard[i][j].color = currentBoard[x][y].color;
				$("#"+makeId(i,j)+" > rect").css("fill", currentBoard[i][j].color);
				console.log("Changing color");
				eraseDetachedPortion(i,j);
				return;
			} else {
				console.log("This player does not have an adjacent square");
			}
		}
	}
}

function changePlayer() {
	if(currentPlayer === GREEN) {
		currentPlayer = RED;
	} else {
		currentPlayer = GREEN;
	}
}

function erasedDetachedPortion(i,j) {
	
}
