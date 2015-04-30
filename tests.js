go();

QUnit.skip("Test space object color", function( assert ) {
	var space = new Space(RED);
	assert.ok( space.color === RED, "Red is red!" );
	assert.ok( space.color !== GREEN, "Red is not green" );
	assert.ok( space.color !== WHITE, "Red is not white" );
	space = new Space(GREEN);
	assert.ok( space.color === GREEN, "Green is green");
	assert.ok( space.color !== RED, "Green is not red") ;
	assert.ok( space.color !== WHITE, "Green is not white");
	space = new Space(WHITE);
	assert.ok( space.color === WHITE, "White is white");
	assert.ok(space.color !== RED, "White is not red");
	assert.ok(space.color !== GREEN, "White is not green");
});

QUnit.skip("Test board color highlighting", function ( assert ) {
	var board = new Board(6,23,GREEN);
	for(var i = 0; i < board.width; ++i) {
		assert.ok(board[i][board.length-1] === GREEN);
		assert.ok(board[i][0] === RED);
	}
});

QUnit.test("Test letter distribution", function( assert ) {
	assert.expect(26);	

	var lettersStr = "abcdefghijklmnopqrstuvwxyz";
	var letters = lettersStr.split('');
	var distr = {};
	for(var i in letters) {
		distr[letters[i]] = 0;
	}
	
	for(var i = 0; i < 1000000; ++i) {
		++distr[randomLetter()];
	}
	
	for(var letter in englishLetterFrequencies) {
		var diff = Math.abs(englishLetterFrequencies[letter]*1000 - distr[letter]);
		assert.push(diff < 1000, 0, diff, "Our randomized letters should match the distribution we're using to within .1% over large data samples");
	}
});

QUnit.test("Check that board is initialized", function(assert) {
	assert.expect(currentBoardWidth * currentBoardLength);

	for(var i = 0; i < currentBoardWidth; ++i) {
		for(var j = 0; j < currentBoardLength; ++j) {
			assert.ok(currentBoard[i][j], "Board at position "+i+", "+j+" should be initialized (value: "+currentBoard[i][j].letter+")");
		}
	}
});

QUnit.test("MakeID", function(assert) {
	assert.expect(100);
	for(var i = 0; i < 10; i++) {
		for(var j = 0; j < 10; j++) {
			assert.strictEqual(makeId(i,j), makeId(i,j), "it should be idempotent");
		}
	}
});

QUnit.test("Check the board coloring", function(assert) {
	assert.expect(2 * currentBoardWidth * currentBoardLength);
	for(var i = 0; i < currentBoardLength; ++i) {
		if(i === 0) { var color = GREEN; }
		else if (i === 12) { var color = RED; }
		else { var color = WHITE; }
		for(var j = 0; j < currentBoardWidth; ++j) {
			assert.push(checkColorsEqual(currentBoard[j][i].color, color), currentBoard[j][i].color, color, "The reported color should corrospond to position in the board");
		}
	}
	for(var i = 0; i < currentBoardLength; ++i) {
		if(i === 0) { var color = GREEN; }
		else if(i === 12) { var color = RED; }
		else { var color = WHITE; }
		for(var j = 0; j < currentBoardWidth; ++j) {
			assert.push(checkColorsEqual($("#"+makeId(j,i)+"> rect").css("fill"), color), $("#"+makeId(j,i)+"> rect").css("fill"), color, "The actual color should correspond to position in the board");
		}
	}
});

function checkColorsEqual(actual, expected) {
	if(expected == RED) {
		if(actual == RED || actual == "#e60000" || actual == "red") return true;
	} else if(expected == GREEN) {
		if(actual == GREEN || actual == "#00b400" || actual == "green") return true;
	} else if(expected == WHITE) {
		if(actual == WHITE || actual == "#ffffff" || actual == "#fff" || actual == "rgb(255,255,255)") return true;
	} else if(expected == actual) return true;
	return false;
}
