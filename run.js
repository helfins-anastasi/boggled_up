frequencies = {"a":82,"b":15,"c":28,"d":43,"e":127,"f":22,"g":20,"h":61,"i":70,"j":2,"k":8,"l":40,"m":24,"n":67,"o":75,"p":19,"q":1,"r":60,"s":63,"t":91,"u":28,"v":10,"w":24,"x":2,"y":20,"z":1}
letters = [];

currentBoard = {};

for(var letter in frequencies){
	for(var i = 0; i < frequencies[letter]; i++) {
		letters.push(letter);
	}
}

function go() {
	console.log("Code is running");

	for(var i = 0; i < 10; i++) {
		currentBoard[i] = {};
		for(var j=0; j<13;j++) {
			currentBoard[i][j] = {letter:letters[Math.floor(Math.random()*letters.length)], 
					color:(j===0 ? "rgb(0,180,0)" : (j===12 ? "red" : "white"))};
		}
	}

	$("#svg").ready(function () { drawBoard(); });
}

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

function makeId(i,j) {
	return "space"+i+"_"+j;
}

function selectBoggleSquare(i,j) {
	$("#"+makeId(i,j)+" > rect").css("fill", "blue");
	console.log("Clicked on square "+i+", "+j);
}
