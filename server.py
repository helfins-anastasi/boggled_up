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
	
def boardLoad():
	width = int(f.request.form['width'])
	height = int(f.request.form['height'])
	ind = int(f.request.form['player'])
	temp = getBoard(width, height)
	players[ind] = Player(ind, width)
	return json.dumps(temp)
	
	
	
	



@app.route("/", methods=['GET', 'PUT'])
def mainPage():
	if f.request.method == 'PUT':
		return boardLoad()
	else:
		return f.send_file("index.html")

@app.route("/move", methods=['PUT'])
def makeMove():
	player = int(f.request.form['player'])
	moves = f.request.form['moves']
	for i in moves:
		x = int(moves[i]['x'])
		y = int(moves[i]['y'])
		char = int(moves[i]['char'])
		if(board[x][y] != char):
			return json.dumps({"status":"failed", "error": "board does not match", "x":x, "y":y})
		players[player].spaces.append((x,y,char))

@app.route("/favicon.ico")
def func():
	return f.send_file("favicon.ico")
	
@app.route("/run.js")
def run():
	return f.send_file("run.js")
	
@app.route("/test")
def test():
	return f.send_file("test.html")

@app.route("/tests.js")
def tests_js():
	return f.send_file("tests.js")
	
if __name__ == "__main__":
	app.run(host="0.0.0.0")
