//Set up colors
RED = "rgb(230,0,0)", GREEN = "rgb(0,180,0)", WHITE = "white";
//Also brighter versions for when the square is selected
BRIGHT_RED = "rgb(255, 0, 0)", BRIGHT_GREEN = "rgb(0,230,0)";


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



//A class for each space
function Space(letter, player, x, y) {
	this.letter = letter;
	this.player = player;
	this.setPlayer = function(val) {
		this.player = val;
		this.color = colorTransform[val];
		this.tempPlayer = false;
	}
	this.color = colorTransform[player];
	this.x = x;
	this.y = y;
	this.tempPlayer = false;
	this.flipped = false;
	this.flip = function(player) { //Bool parameter, optional (if undefined, flipped is treated as unselect)
		if(player !== undefined) {
			console.log("value defined: "+player);
			this.flipped = player != -1;
			this.color = brighten[colorTransform[player]];
			if(player == -1) {
				this.tempPlayer = false;
			} else {
				this.tempPlayer = player;
			}
		} else {
			console.log("value undefined");
			this.flipped = !this.flipped;
			if(this.color == WHITE) {
				this.color = brighten[colorTransform[currentPlayer]];
			} else {
				this.color = colorTransform[this.player];
				this.tempPlayer = false;
				//this.player = -1;
			}
		}
		return this.color != WHITE;
	};
	this.redraw = function() {
		$("#"+makeId(this.x,this.y)+" > rect").css("fill", this.color);
	}
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

//Abstracts the id for each square to just its index
function makeId(i,j) {
	return "space"+i+"_"+j;
}

function unselect(i,j) {
	console.log("calling unselect");
	while(currentMove.length > 0) {
		var popped = currentMove.pop();
		popped.flip();
		popped.redraw();
		removeLetter(popped.letter);
		if(popped == currentBoard[i][j]) break;
	}
}

function selectSpace(i,j) {
	currentMove.push(currentBoard[i][j]);
	addLetter(currentBoard[i][j].letter);
	currentBoard[i][j].flip(currentPlayer);
	currentBoard[i][j].redraw();
}