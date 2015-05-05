from flask import Flask
import json as j

app = Flask(__name__)

@app.route("/")
def hello():
	return "Hello World!"
	
@app.route("/board")
def other():
	return "<table></table>"
if __name__ == "__main__":
	app.run(host="0.0.0.0")