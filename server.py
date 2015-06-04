import flask as f
import random as r
import json
from collections import defaultdict

class TrieNode:
	def __init__(self):
		self.children = defaultdict(TrieNode)
		self.word = False
					
	def add_word(self, word): #this function behaves as if this is the root node
		if len(word) == 0:
			self.word = True
			return
		letter = word[0]
		self.children[letter].add_word(word[1:])
	

dictionary = open("Dictionary.txt", 'r')
root = TrieNode()

for line in dictionary:
	root.add_word(line.strip())

dictionary.close()

app = f.Flask(__name__)

class Game:
	def __init__(self, width, height, id):
		self.board = []
		self.width = width
		self.height = height
		self.status = "success"
		self.currentPlayer = 0
		self.wordList = []
		self.moves = []
		self.id = id
		for i in range(height):
			self.board.append([])
			if i == 0 or i == height-1:
				temp = i
			else:
				temp = -1
			for j in range(width):
				self.board[i].append({"x":i,"y":j,"player":temp,"letter":randomLetter()})
			
	def __str__(self):
		string = "";
		for i in range(self.height):
			for j in range(self.width):
				string += str(self.board[i][j]['player'])
				string += '\t'
			string += '\n'
		return string

	def findPath(self, x, y):
		player = self.board[x][y]["player"]
		stack = []
		lookedAt = []
		while(x != player):
			for i in range(x-1,x+2):
				if i < 0:
					continue
				elif i == self.height:
					continue
				for j in range(y-1,y+2):
					if j < 0:
						continue
					elif j == self.width:
						continue
					#Avoid infinite loops
					elif i == x and j == y:
						continue
					if self.board[i][j]["player"] == player:
						newStackItem = {"x":i, "y":j}
						if (not stackContains(newStackItem,stack)) and (not stackContains(newStackItem, lookedAt)):
							stack.append(newStackItem)
			if len(stack) == 0:
				return False
			nxt = stack.pop()
			x = nxt["x"]
			y = nxt["y"]
			lookedAt.append(nxt)
		return True;

	
	def checkConnected(self, location, player):
		result = []	
		stack = []
		while len(stack) > 0:
			elem = stack.pop()
			x = elem[0]
			y = elem[1]
			for i in range(x-1, x+2):
				if i <= 0 or i >= self.height-1:
					continue
				for j in range(y-1, y+2):
					if j < 0 or j > self.width - 1:
						continue
					if self.board[i][j]["player"] != player:
						continue
					stack.append((i,j))
			if not self.findPath(x, y):
				result.append({"x":x, "y":y, "letter":self.board[x][y]["letter"], "player":-1})
		return result
	
	def makeMove(self, player, moves):
		if not (player == self.currentPlayer):
			self.status = "failed"
			return json.dumps({"status": self.status, "error": "wrong player", "player":self.currentPlayer})
		self.status = "success"
		word = ""
		changes = []
		crossings = []
		hasWon = False
		current_node = root
		for i in range(len(moves)//3):
			x = int(moves[3*i])
			y = int(moves[3*i+1])
			char = moves[3*i+2]
			if(self.board[x][y]["letter"] != char):
				print("makeMove() failed")
				self.status = "failed"
				return json.dumps({"status":self.status, "error": "board does not match", "x":x, "y":y})

			current_node = current_node.children[char]

			word += char
			if self.board[x][y]["player"] != -1 and self.board[x][y]["player"] != player:
				crossings.append((x,y))
			changes.append({"x":x, "y":y, "letter":char, "player":player})
			if (player == 0 and x == self.height - 1) or (player == self.height - 1 and x == 0):
				hasWon = True;	

		if not current_node.word:
			self.status = "failed"
			return json.dumps({"status":self.status,"error":"not a word", "word":word})
		
		if word in self.wordList:
			self.status = "failed"
			return json.dumps({"status":self.status,"error":"repeat","word":word})
		else:
			self.wordList.append(word)

		if player == 0:
			otherPlayer = self.height - 1
		else:
			otherPlayer = 0
			
		for cross in crossings:
			changes.extend(self.checkConnected(cross, otherPlayer))
		self.moves.append({"word":word, "player":self.currentPlayer})

		for change in changes:
			self.board[change["x"]][change["y"]]["player"] = change["player"]
		
		if hasWon:
			self.status = "win"
			self.currentPlayer = player
		elif (self.currentPlayer == 0):
			self.currentPlayer = self.height - 1
		else:
			self.currentPlayer = 0
		
		return json.dumps({"status":self.status, "changes":json.dumps(changes), "player":self.currentPlayer})

	def encode(self):
		return json.dumps({"board":self.board, "status":self.status, "id":self.id, "player":self.currentPlayer, "previousMoves":self.moves})
	

#Currently based on frequency of letters in the english language, but can be modified as needed.	
letterFrequencies = {"a":82,"b":15,"c":28,"d":43,"e":127,"f":22,"g":20,"h":61,"i":70,"j":2,"k":8,"l":40,"m":24,"n":67,"o":75,"p":19,"q":1,"r":60,"s":63,"t":91,"u":28,"v":10,"w":24,"x":2,"y":20,"z":1}
lettersForSampling = []
for letter in letterFrequencies:
	for i in range(letterFrequencies[letter]):
		lettersForSampling.append(letter)

def randomLetter():
	return r.choice(lettersForSampling)

games = []

def printChanges(array):
	for i in array:
		print("("+str(i["x"])+", "+str(i["y"])+") '"+i["letter"]+"' player:"+str(i["player"]))

def stackContains(element, array):
	for elem in array:
		if elem["x"] == element["x"] and elem["y"] == element["y"]:
			return True	


	
##################################################	



@app.route("/", methods=['GET'])
def mainPage():
	return f.send_file("index.html")

@app.route("/board", methods=['GET', 'POST'])
def _board():
	if f.request.method == 'GET':
		return json.dumps({"count":len(games)})
	else:
		width = f.request.form['width']
		height = f.request.form['height']
		newGame = Game(int(width), int(height), len(games))
		games.append(newGame)
		return newGame.encode()

@app.route("/board/<int:number>", methods=['GET','PUT'])
def _board_(number):
	if f.request.method == 'GET':
		return games[number].encode()
	else:
		movesVar = f.request.form['moves']
		playerVar = f.request.form['player']
		return games[number].makeMove(int(playerVar), json.loads(movesVar))

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
	app.run(host="0.0.0.0", debug=True,port=8080)
