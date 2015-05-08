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

board = None

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
	
def boardLoad():
	temp = getBoard(int(f.request.form['width']),int(f.request.form['height']))
	return json.dumps(temp)
	
	
				

@app.route("/", methods=['GET', 'PUT'])
def mainPage():
	if f.request.method == 'PUT':
		return boardLoad()
	else:
		return f.send_file("index.html")
	
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
