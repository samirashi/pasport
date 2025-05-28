from flask import Flask, request, jsonify, render_template
from models import db, Subject, Class

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///schedule.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()
    # Создаем предметы, если их нет
    if Subject.query.count() == 0:
        subjects = [Subject(name='Математика'), Subject(name='Физика'), Subject(name='История')]
        db.session.add_all(subjects)
        db.session.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/subjects')
def get_subjects():
    subjects = Subject.query.all()
    return jsonify([{'id': s.id, 'name': s.name} for s in subjects])

@app.route('/classes')
def get_classes():
    classes = Class.query.all()
    result = []
    for c in classes:
        result.append({
            'id': c.id,
            'subject_id': c.subject_id,
            'subject_name': c.subject.name,
            'teacher': c.teacher,
            'day': c.day,
            'time': c.time,
            'duration': c.duration
        })
    return jsonify(result)

@app.route('/classes', methods=['POST'])
def add_class():
    data = request.get_json()
    new_class = Class(
        subject_id=data['subject_id'],
        teacher=data['teacher'],
        day=data['day'],
        time=data['time'],
        duration=data['duration']
    )
    db.session.add(new_class)
    db.session.commit()
    return jsonify({'message': 'Занятие добавлено', 'id': new_class.id}), 201

@app.route('/classes/<int:id>', methods=['PUT'])
def update_class(id):
    data = request.get_json()
    c = Class.query.get_or_404(id)
    c.subject_id = data.get('subject_id', c.subject_id)
    c.teacher = data.get('teacher', c.teacher)
    c.day = data.get('day', c.day)
    c.time = data.get('time', c.time)
    c.duration = data.get('duration', c.duration)
    db.session.commit()
    return jsonify({'message': 'Занятие обновлено'})

@app.route('/classes/<int:id>', methods=['DELETE'])
def delete_class(id):
    c = Class.query.get_or_404(id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({'message': 'Занятие удалено'})

if __name__ == '__main__':
    app.run(debug=True)