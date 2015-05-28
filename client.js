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


function getBoard(id) { //Optional parameter, if undefined then get a new board
	function successFunction(data, textStatus, jqXHR) {
		data = JSON.parse(data);
		
		currentBoardId = data['id'];
		var tempBoard = data['board'];
		changePlayer(data['player']);
		appendMoves(data['previousMoves']);
		
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
		$("#boardNumber").val(currentBoardId);
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

function appendMoves(moves) {
	var result = "";
	for(var i in moves) {
		console.log("moves[i]:");
		console.log(moves[i]);
		console.log("moves[i].word:");
		console.log(moves[i].word);
		result += '<p style="color:'+colorTransform[moves[i].player]+'">' + moves[i].word + "</p>";
	}
	$("#moves")[0].innerHTML = (result);
}

function appendWord() {
	var word = "";
	for(var i in currentMove) {
		word += currentMove[i].letter;
	}
	$("#moves")[0].innerHTML += '<p style="color:'+colorTransform[currentPlayer]+'">'+word+"</p>";
}

//Place for setup that has to be done after page loads
function go() {
	getBoard();
	console.log("Loading...");
	$("body").append('<div id="moves" style="font:20px bold;dispaly:inline;"></div>')
	$("body").append('<p id="selectedWord" style="font:20px bold;display:inline;margin:-200px 20px 0 20px;"> </p>')
	$("body").append('<button id="submitMove" onclick="submitMove();">Submit Move!</button>');
	$("body").append('<input type="text" id="boardNumber"></input>');
	$("body").append('<button id="load board" onclick="loadBoard();">Load board</button>');
}

function goPart2() {
	drawBoard();
}

function loadBoard() {
	getBoard($("#boardNumber").val());
}

//Draws the board
function drawBoard() {
	var size = 30;
	$("#svg").remove();
	var str = '<svg id="svg" style="float:left;padding-right:20px;" width="'+currentBoardWidth*size+'" height="'+currentBoardLength*size+'">';
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
	$("h1").after(str);
	disableSelection($("#svg")[0]);
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

function selectBoggleSquare(i,j) {
	//In the case that it is already selected
	if(currentBoard[i][j].tempPlayer !== false) {
		unselect(i,j);
		return;
	}
	
	//In the case that we have no move yet
	if(currentMove.length == 0) {
		//If the selected square is our color, start the move
		if(currentBoard[i][j].player == currentPlayer) {
			selectSpace(i,j);
		}
		return;
	}
	
	//If it's within one space
	var lastSpace = currentMove[currentMove.length-1]; 
	if(Math.abs(lastSpace.x - i) <= 1 
				&& Math.abs(lastSpace.y - j) <= 1) { //In both directions
		selectSpace(i,j);
		return;
	}
}

function changePlayer(player) {
	currentMove = [];
	$("#selectedWord")[0].innerHTML = "";
	if(player === undefined) {
		console.log("ERROR: invalid value for player");
	}
	currentPlayer = player;
	console.log("in changePlayer() - current player is "+currentPlayer);
}

function encodeMove(moveList) {
	var result = [];
	if(moveList.length == 0) return false;
	for(var i in moveList) {
		var mv = moveList[i];
		result.push(mv.x);
		result.push(mv.y);
		result.push(mv.letter);
	}
	return result;
}

function submitMove() {
	function successFunction(data, textStatus, jqXHR) {
		data = JSON.parse(data);
		if(data.status == "failed") {
			if(data.error == "repeat") {
				alert('The word "'+data.word+'" has already been played! Please try a different word.');
				unselect(currentMove[0].x, currentMove[0].y);
				return;
			}
			alert("We're sorry, something has gone wrong. Please reload the page.");
			return;
		}
		data.changes = JSON.parse(data.changes);
		appendWord();
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
		changePlayer(data.player);
	}
	var dataObj = {};
	var encoded = encodeMove(currentMove);
	if(encoded) { 
		dataObj["moves"] = JSON.stringify(encoded);
	} else { 
		return;
	}
	dataObj["player"] = currentPlayer;
	dataObj["id"] = currentBoardId;
	$.ajax("/move", {data: dataObj, method: "PUT",
						type: "PUT", 
						success: successFunction});
}

function disableSelection(element) {
	if (typeof element.onselectstart != 'undefined') {
		element.onselectstart = function() { return false; };
	} else if (typeof element.style.MozUserSelect != 'undefined') {
		element.style.MozUserSelect = 'none';
	} else {
		element.onmousedown = function() { return false; };
	}
}