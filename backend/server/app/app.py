from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///internship.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'SJLDfsdfhsjdhjh12j4hj1k2h4jk21hjk4hgh12g4h12g4hj124g2h4hgh12hg412'

db = SQLAlchemy(app)


from routes import *

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
