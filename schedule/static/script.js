let subjects = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchSubjects();
    loadClasses();

    document.getElementById('classForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveClass();
    });
});

function fetchSubjects() {
    fetch('/subjects')
        .then(res => res.json())
        .then(data => {
        subjects = data;
        const select = document.getElementById('subjectSelect');
        select.innerHTML = '';
        subjects.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.name;
            select.appendChild(option);
        });
    });
}

function loadClasses() {
    fetch('/classes')
        .then(res => res.json())
        .then(data => {
        const tbody = document.querySelector('#scheduleTable tbody');
        tbody.innerHTML = '';
        data.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
          <td>${c.subject_name}</td>
          <td>${c.teacher}</td>
          <td>${c.day}</td>
          <td>${c.time}</td>
          <td>${c.duration}</td>
          <td>
            <button onclick="editClass(${c.id})">Редактировать</button>
            <button onclick="deleteClass(${c.id})">Удалить</button>
          </td>`;
            tbody.appendChild(tr);
        });
    });
}

function showAddForm() {
    document.getElementById('formTitle').textContent = 'Добавить занятие';
    document.getElementById('classForm').reset();
    document.getElementById('classId').value = '';
    editingId = null;
    document.getElementById('formContainer').style.display = 'block';
}

function hideForm() {
    document.getElementById('formContainer').style.display = 'none';
}

function saveClass() {
    const subject_id = parseInt(document.getElementById('subjectSelect').value);
    const teacher = document.getElementById('teacher').value;
    const day = document.getElementById('day').value;
    const time = document.getElementById('time').value;
    const duration = parseInt(document.getElementById('duration').value);

    const data = { subject_id, teacher, day, time, duration };

    if (editingId) {
        fetch('/classes/' + editingId, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(res => res.json())
            .then(() => {
            hideForm();
            loadClasses();
        });
    } else {
        fetch('/classes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(res => res.json())
            .then(() => {
            hideForm();
            loadClasses();
        });
    }
}

function editClass(id) {
    fetch('/classes')
        .then(res => res.json())
        .then(data => {
        const c = data.find(item => item.id === id);
        if (c) {
            document.getElementById('formTitle').textContent = 'Редактировать занятие';
            document.getElementById('classId').value = c.id;
            document.getElementById('teacher').value = c.teacher;
            document.getElementById('day').value = c.day;
            document.getElementById('time').value = c.time;
            document.getElementById('duration').value = c.duration;
            document.getElementById('subjectSelect').value = c.subject_id;
            editingId = c.id;
            document.getElementById('formContainer').style.display = 'block';
        }
    });
}

function deleteClass(id) {
    if (confirm('Удалить занятие?')) {
        fetch('/classes/' + id, {method: 'DELETE'})
            .then(res => res.json())
            .then(() => loadClasses());
    }
}