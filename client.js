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

//Place for setup that has to be done after page loads
function go() {
	//currentBoard = getBoard();
	getBoard();
	console.log("Loading...");
}

function goPart2() {
	drawBoard();
	var value = $("body").has("#selectedWord");
	console.log("Value: ");console.log(value);
	if(!value[0]) {
		console.log("true");
		$("body").append('<p id="selectedWord" style="font:20px bold;display:inline;margin:-200px 20px 0 20px;"> </p>')
		$("body").append('<button id="submitMove" onclick="submitMove();">Submit Move!</button>');
		$("body").append('<input type="text" id="boardNumber"></input>');
		$("body").append('<button id="load board" onclick="loadBoard();">Load board</button>');
	}
}

function loadBoard() {
	getBoard($("#boardNumber").val());
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
		if(currentBoard[i][j].player == player[WHITE]) { //If space was not made white
			currentBoard[i][j].flip();
			selectSpace(i,j);
		} else if(currentBoard[i][j].player == currentPlayer) {
			
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