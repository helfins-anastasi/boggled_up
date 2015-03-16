QUnit.test("Test space object color", function( assert ) {
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
QUnit.test("Test board color highlighting", function ( assert ) {
	var board = new Board(6,23,GREEN);
	for(var i = 0; i < width; ++i) {
		assert.ok(board[i][0] === GREEN);
		assert.ok(board[i][board.length-1] === RED);
	}
});
