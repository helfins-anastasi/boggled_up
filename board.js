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
		this.tempPlayer = false;
	}
	this.color = colorTransform[player];
	this.x = x;
	this.y = y;
	this.tempPlayer = false;
	this.flipped = false;
	this.flip = function(val) { //Bool parameter, optional (if undefined, flipped is toggled and color is assigned based on colorTransform[currentPlayer])
		if(val !== undefined) {
			this.flipped = val != WHITE;
			this.color = val;
			this.tempPlayer = player[val];
		} else {
			this.flipped = !this.flipped;
			if(this.color == WHITE) {
				this.color = brighten[colorTransform[currentPlayer]];
				this.tempPlayer = currentPlayer;
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