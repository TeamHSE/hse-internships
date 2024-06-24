from flask import request, jsonify, make_response
from app import app, db
from models import User, Tag, UserTag, Event, TagEvent, UserEventParticipants
from flask_bcrypt import Bcrypt
from datetime import datetime
import base64

bcrypt = Bcrypt(app)


@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    if not email or not password or not role or not first_name or not last_name:
        return jsonify({'error': 'Missing required fields'}), 400

    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(
            email=email,
            password=hashed_password,
            role=role,
            first_name=first_name,
            last_name=last_name
    )

    db.session.add(new_user)
    db.session.commit()

    token = generate_basic_token(email, password)

    response = make_response(jsonify({'message': 'User registered successfully'}), 200)
    response.set_cookie('token', token, max_age=2592000, secure=True, httponly=True)

    return response


@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_basic_token(email, password)

    response = make_response(jsonify({'message': 'User logged in successfully'}), 200)
    response.set_cookie('token', token, max_age=2592000, secure=True, httponly=True)

    return response


@app.route('/api/logout', methods=['POST'])
def logout_user():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        email, password = decode_basic_token(token)
        if not email or not password:
            return jsonify({'error': 'Invalid token'}), 401

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({'error': 'Invalid credentials'}), 401

        response = make_response(jsonify({'message': 'User logged out'}), 200)
        response.set_cookie('token', '', expires=0, secure=True, httponly=True)
        return response

    except Exception as e:
        print(f"Error during logout: {e}")
        return jsonify({'error': 'Logout failed'}), 500


@app.route('/api/tag', methods=['POST'])
def create_tag():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        email, password = decode_basic_token(token)
        if not email or not password:
            return jsonify({'error': 'Invalid token'}), 401

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({'error': 'Invalid credentials'}), 401

        data = request.json
        tag_name = data.get('tag_name')

        if not tag_name:
            return jsonify({'error': 'Tag name is missing'}), 400

        # Create and add the tag to the database
        new_tag = Tag(tag_name=tag_name)
        db.session.add(new_tag)
        db.session.commit()

        return jsonify({'message': 'Tag created successfully'}), 201

    except Exception as e:
        print(f"Error during tag creation: {e}")
        return jsonify({'error': 'Tag creation failed'}), 500


@app.route('/api/tag', methods=['GET'])
def get_tags():
    try:
        tags = Tag.query.all()
        tag_list = []
        for tag in tags:
            tag_list.append({
                    'tag_id'  : tag.tag_id,
                    'tag_name': tag.tag_name
            })
        return jsonify(tag_list), 200

    except Exception as e:
        print(f"Error fetching tags: {e}")
        return jsonify({'error': 'Failed to fetch tags'}), 500


@app.route('/api/users/<int:user_id>/tags', methods=['POST'])
def add_tag_to_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.json
        tag_id = data.get('tag_id')

        if not tag_id:
            return jsonify({'error': 'Tag ID is missing'}), 400

        tag = Tag.query.get(tag_id)
        if not tag:
            return jsonify({'error': 'Tag not found'}), 404

        if UserTag.query.filter_by(user_id=user_id, tag_id=tag_id).first():
            return jsonify({'error': 'Tag already assigned to user'}), 400

        new_user_tag = UserTag(user_id=user_id, tag_id=tag_id)
        db.session.add(new_user_tag)
        db.session.commit()

        return jsonify({'message': 'Tag added to user successfully'}), 201

    except Exception as e:
        print(f"Error adding tag to user: {e}")
        return jsonify({'error': 'Failed to add tag to user'}), 500


@app.route('/api/users/<int:user_id>/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag_from_user(user_id, tag_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        tag = Tag.query.filter_by(tag_id=tag_id).first()
        if not tag:
            return jsonify({'error': 'Tag not found'}), 404

        user_tag = UserTag.query.filter_by(user_id=user_id, tag_id=tag.tag_id).first()
        if not user_tag:
            return jsonify({'error': 'Tag is not assigned to the user'}), 404

        db.session.delete(user_tag)
        db.session.commit()

        return jsonify({'message': 'Tag removed from user successfully'}), 200

    except Exception as e:
        print(f"Error deleting tag from user: {e}")
        return jsonify({'error': 'Failed to delete tag from user'}), 500


@app.route('/api/events', methods=['POST'])
def create_event():
    try:
        data = request.json
        name = data.get('name')
        event_type = data.get('type')
        organizer_id = data.get('organizerId')

        if not name or not event_type or not organizer_id:
            return jsonify({'error': 'Name, type, and organizerId are required fields'}), 400

        organizer = User.query.get(organizer_id)
        if not organizer:
            return jsonify({'error': 'Organizer not found'}), 404

        end_date_str = data.get('endDate')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%dT%H:%M:%S.%fZ') if end_date_str else None

        # Получаем event_date из JSON запроса, обрабатываем его
        event_date_str = data.get('event_date')
        event_date = datetime.strptime(event_date_str, '%Y-%m-%dT%H:%M:%S.%fZ') if event_date_str else None

        new_event = Event(
                event_name=name,
                event_type=event_type,
                organizer_name=organizer.first_name + ' ' + organizer.last_name,
                event_date=event_date,  # Передаем обработанное значение event_date
                end_date=end_date,
                description=data.get('description'),
                author_id=organizer_id
        )

        db.session.add(new_event)
        db.session.commit()

        # Получаем event_id только что созданного события
        event_id = new_event.event_id

        # Добавление тегов к событию через таблицу TagEvent
        tags = data.get('tags')
        if tags:
            for tag_id in tags:
                tag = Tag.query.get(tag_id)
                if tag:
                    tag_event = TagEvent(tag_id=tag_id, event_id=event_id)
                    db.session.add(tag_event)

        db.session.commit()

        return jsonify({'message': 'Event added successfully', 'event_id': event_id}), 201

    except Exception as e:
        print(f"Error creating event: {e}")
        db.session.rollback()  # Откатываем изменения в случае ошибки
        return jsonify({'error': 'Failed to create event'}), 500


@app.route('/api/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    try:
        event = Event.query.get(event_id)

        if not event:
            return jsonify({'error': 'Event not found'}), 404

        data = request.json

        event.event_name = data.get('name', event.event_name)
        event.event_type = data.get('type', event.event_type)
        event_date_str = data.get('event_date')
        if event_date_str:
            event.event_date = datetime.strptime(event_date_str, '%Y-%m-%dT%H:%M:%S.%fZ')
        event.organizer_name = data.get('organizerName', event.organizer_name)
        event.end_date = datetime.strptime(data.get('endDate'), '%Y-%m-%dT%H:%M:%S.%fZ') if data.get(
                'endDate') else None
        event.description = data.get('description', event.description)

        organizer_id = data.get('organizerId')
        if organizer_id:
            organizer = User.query.get(organizer_id)
            if not organizer:
                return jsonify({'error': 'Organizer not found'}), 404
            event.author_id = organizer_id
            event.organizer_name = organizer.first_name + ' ' + organizer.last_name

        db.session.commit()

        tags = data.get('tags')
        if tags is not None:
            TagEvent.query.filter_by(event_id=event_id).delete()
            for tag_id in tags:
                tag = Tag.query.get(tag_id)
                if tag:
                    tag_event = TagEvent(tag_id=tag_id, event_id=event_id)
                    db.session.add(tag_event)

            db.session.commit()

        return jsonify({'message': 'Event updated successfully', 'event_id': event.event_id}), 200

    except Exception as e:
        print(f"Error updating event: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update event'}), 500


@app.route('/api/events', methods=['GET'])
def get_events():
    try:
        events = Event.query.all()
        event_list = []

        for event in events:
            tags = Tag.query.join(TagEvent).filter(TagEvent.event_id == event.event_id).all()
            tag_names = [tag.tag_name for tag in tags]

            event_data = {
                    'event_id'      : event.event_id,
                    'event_name'    : event.event_name,
                    'event_type'    : event.event_type,
                    'organizer_name': event.organizer_name,
                    'event_date'    : event.event_date,
                    'end_date'      : event.end_date.isoformat() if event.end_date else None,
                    'description'   : event.description,
                    'tags'          : tag_names
            }
            event_list.append(event_data)

        return jsonify({'events': event_list}), 200

    except Exception as e:
        print(f"Error fetching events: {e}")
        return jsonify({'error': 'Failed to fetch events'}), 500


@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        event = Event.query.get(event_id)

        if not event:
            return jsonify({'error': 'Event not found'}), 404

        db.session.delete(event)
        db.session.commit()

        return jsonify({'message': 'Event deleted successfully'}), 200

    except Exception as e:
        print(f"Error deleting event: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete event'}), 500


@app.route('/api/users/<int:user_id>/events/<int:event_id>', methods=['POST'])
def subscribe_user_to_event(user_id, event_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        event = Event.query.get(event_id)
        if not event:
            return jsonify({'error': 'Event not found'}), 404

        if UserEventParticipants.query.filter_by(user_id=user_id, event_id=event_id).first():
            return jsonify({'error': 'User already subscribed to this event'}), 400

        subscription = UserEventParticipants(user_id=user_id, event_id=event_id)
        db.session.add(subscription)
        db.session.commit()

        return jsonify(
                {'message': 'User subscribed to event successfully', 'user_id': user_id, 'event_id': event_id}), 201

    except Exception as e:
        print(f"Error subscribing user to event: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to subscribe user to event'}), 500


@app.route('/api/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    try:
        tag = Tag.query.get(tag_id)
        if not tag:
            return jsonify({'error': 'Tag not found'}), 404

        db.session.delete(tag)
        db.session.commit()

        return jsonify({'message': 'Tag deleted successfully'}), 200

    except Exception as e:
        print(f"Error deleting tag: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete tag'}), 500


def generate_basic_token(email, password):
    token = email + ':' + password
    basic_token = base64.b64encode(token.encode()).decode('utf-8')
    return basic_token


def decode_basic_token(basic_token):
    try:
        decoded_token = base64.b64decode(basic_token).decode('utf-8')
        email, password = decoded_token.split(':')
        return email, password
    except Exception as e:
        print(f"Error decoding Basic token: {e}")
        return None, None


def validate_email(email):
    if '@' in email and '.' in email:
        return True
    return False
