import flask as f
import random as r
import json

app = f.Flask(__name__)
	

#Currently based on frequency of letters in the english language, but can be modified as needed.	
letterFrequencies = {"a":82,"b":15,"c":28,"d":43,"e":127,"f":22,"g":20,"h":61,"i":70,"j":2,"k":8,"l":40,"m":24,"n":67,"o":75,"p":19,"q":1,"r":60,"s":63,"t":91,"u":28,"v":10,"w":24,"x":2,"y":20,"z":1}
lettersForSampling = []
for letter in letterFrequencies:
	for i in range(letterFrequencies[letter]):
		lettersForSampling.append(letter)

def randomLetter():
	return r.choice(lettersForSampling)

def getBoard(width,height):
	board = []
	for i in range(height):
		board.append([])
		if i == 0 or i == height-1:
			temp = i
		else:
			temp = -1
		for j in range(width):
			board[i].append({"letter": randomLetter(), "player": temp})
			
	boards.append(board);
	return {"board":board, "id":(len(boards)-1)}

boards = []
		
def printPlayerBoard(ind):
	print ("in printPlayerBoard")
	board = boards[ind]
	print("got the board")
	print("len(board) = "+len(board));
	for i in len(board):
		print("in outer loop "+str(i))
		string = "";
		for j in len(board[i]):
			print("in inner loop "+str(j))
			string += board[i][j]['player']
			string += '\t'
		print(string)

#def findPath(x, y, boardId, player):
#	myBoard = boards[boardId]
#	stack = []
#	while(x != player):
#		for i in range(x-1,x+1):
#			for j in range(y-1,y+1):
#				if myBoard[i][j]["player"] == player:
#					stack.append({"x":i, "y":j})
#		if len(stack) == 0:
#			return False
#		nxt = stack.pop()
#		x = nxt["x"]
#		y = nxt["y"]
#	return True;

def checkConnected(boardId):
	result = []	
	for i in range(boards[boardId]):
		if i == 0 or i == (len(boards[boardId])-1):
			continue
		for j in boards[boardId][i]:
		alkdnfawk = boards[boardId][i]
#			if boards[boardId][i][j]["player"] != -1:
#				print("loop")
#				if not findPath(i, j, boardId, boards[boardId][i][j]["player"]):
#					boards[boardId][i][j]["player"] = -1
#					result.append({"x":i, "y":j, "letter":boards[boardId][i][j]["letter"], "player":-1})
	return result
	 
def makeMove(player, moves, boardId):
	changes = []
	for i in range(len(moves)//3):
		x = int(moves[3*i])
		y = int(moves[3*i+1])
		char = moves[3*i+2]
		if(boards[boardId][x][y]["letter"] != char):
			print("makeMove() failed")
			return json.dumps({"status":"failed", "error": "board does not match", "x":x, "y":y})
			
		boards[boardId][x][y]["player"] = player
		changes.append({"x":x, "y":y, "letter":char, "player":player})
		changes.extend(checkConnected(boardId))

#		printPlayerBoard(boardId)
	return json.dumps({"status":"success", "changes":json.dumps(changes)})	


	
##################################################	



@app.route("/", methods=['GET', 'PUT'])
def mainPage():
	if f.request.method == 'PUT':
		kind = f.request.form['type']
		if kind == 'new':
			width = f.request.form['width']
			height = f.request.form['height']
			return json.dumps(getBoard(int(width), int(height)))
		elif kind == 'refresh':
			index = f.request.form['id']
			return json.dumps({"board":boards[int(index)], "id":index})
	else:
		return f.send_file("index.html")

@app.route("/move", methods=['GET','PUT'])
def makeMoveFunctionThingy():
	if(f.request.method == 'PUT'):
		idVar = f.request.form['id']
		movesVar = f.request.form['moves']
		playerVar = f.request.form['player']
		return makeMove(int(playerVar), json.loads(movesVar), int(idVar))
	else:
		return f.send_file("index.html")

@app.route("/favicon.ico")
def favicon_ico():
	return f.send_file("favicon.ico")
	
@app.route("/client.js")
def client_js():
	return f.send_file("client.js")

@app.route("/board.js")
def board_js():
	return f.send_file("board.js")
	
@app.route("/test")
def test():
	return f.send_file("test.html")

@app.route("/tests.js")
def tests_js():
	return f.send_file("tests.js")
	
if __name__ == "__main__":
	app.run(host="0.0.0.0")
