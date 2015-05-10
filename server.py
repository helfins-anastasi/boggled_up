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
	global board
	
	if board != None and width == len(board) and height == len(board[0]):
		return board
	board = []
	for i in range(width):
		board.append([])
		for j in range(height):
			board[i].append(randomLetter())
	return board

class Player:
	spaces = []
	def __init__(self, startRow, width):
		for i in (range(width)):
			self.spaces.append((i, startRow, board[i][startRow]))

board = None
players = {}
	
def boardLoad(width, height, ind):
	temp = getBoard(width, height)
	players[ind] = Player(ind, width)
	return json.dumps(temp)
	
def makeMove(player, moves):
	print("in makeMove "+str(player))
	changes = []
	for i in range(int(len(moves)/3)):
		x = int(moves[3*i])
		y = int(moves[3*i+1])
		char = moves[3*i+2]
		if(board[x][y] != char):
			return json.dumps({"status":"failed", "error": "board does not match", "x":x, "y":y})
		players[player].spaces.append((x,y,char))
		changes.append({"x":x, "y":y, "letter":char, "player":player})
	return json.dumps({"status":"success", "changes":json.dumps(changes)})	
	return json.dumps("[1,2,3]")

	
##################################################	



@app.route("/", methods=['GET', 'PUT'])
def mainPage():
	if f.request.method == 'PUT':
		return boardLoad(int(f.request.form['width']), int(f.request.form['height']), 
						 int(f.request.form['player']) )
	else:
		return f.send_file("index.html")

@app.route("/move", methods=['GET','PUT'])
def makeMoveFunctionThingy():
	if(f.request.method == 'PUT'):
		playerVar = f.request.form['player']
		movesVar = f.request.form['moves']
		return makeMove(int(playerVar), json.loads(movesVar))

	else:
		print ("called with GET")
		return f.send_file("index.html")

@app.route("/favicon.ico")
def favicon_ico():
	return f.send_file("favicon.ico")
	
@app.route("/client.js")
def run():
	return f.send_file("client.js")
	
@app.route("/test")
def test():
	return f.send_file("test.html")

@app.route("/tests.js")
def tests_js():
	return f.send_file("tests.js")
	
if __name__ == "__main__":
	app.run(host="0.0.0.0")
