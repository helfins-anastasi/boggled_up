/* global QUnit */

//go();

QUnit.test("Test space class", function(assert) {
	var white = new Space('r', -1, 5, 5);
	var green = new Space('g', 0, 0, 0);
	var red   = new Space('r', 12, 12,12);
	assert.strictEqual(white.tempPlayer, false, "no space should have a tempPlayer value to start with");
	assert.strictEqual(green.tempPlayer, false, "no space should have a tempPlayer value to start with");
	assert.strictEqual(  red.tempPlayer, false, "no space should have a tempPlayer value to start with");
	assert.strictEqual(  red.flipped, false, "no space should have been flipped to start with");
	assert.strictEqual(white.flipped, false, "no space should have been flipped to start with");
	assert.strictEqual(green.flipped, false, "no space should have been flipped to start with");
	assert.equal(white.color, WHITE, "player of -1 should have color white");
	assert.equal(green.color, GREEN, "player of  0 should have color green");
	assert.equal(  red.color,   RED, "player of 12 should have color red");	

	white.flip();
	green.flip();
	red.flip(GREEN);
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

checkColorsEqual(RED, RED);