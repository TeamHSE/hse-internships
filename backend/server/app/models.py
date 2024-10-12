from app import db

class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    telegram_username = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(200), nullable=False)
    notification_channels = db.Column(db.String(200))
    isMale = db.Column(db.Boolean)
    role = db.Column(db.String(50))

class Event(db.Model):
    event_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    author_id = db.Column(db.Integer, db.ForeignKey('user.user_id', ondelete='CASCADE'), nullable=False)
    event_date = db.Column(db.String(20), nullable=False)
    event_name = db.Column(db.String(255), nullable=False)
    event_type = db.Column(db.String(100), nullable=False)
    organizer_name = db.Column(db.String(255), nullable=False)
    end_date = db.Column(db.DateTime)
    description = db.Column(db.Text)
    author = db.relationship('User', backref=db.backref('events', lazy=True, cascade="all, delete-orphan"))

class Tag(db.Model):
    tag_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tag_name = db.Column(db.String(50), nullable=False)

class TagType(db.Model):
    type_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    type_name = db.Column(db.String(50), nullable=False)

class TagEvent(db.Model):
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.tag_id', ondelete='CASCADE'), primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.event_id', ondelete='CASCADE'), primary_key=True)

class UserEventParticipants(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id', ondelete='CASCADE'), primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.event_id', ondelete='CASCADE'), primary_key=True)

class UserTag(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id', ondelete='CASCADE'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.tag_id', ondelete='CASCADE'), primary_key=True)
