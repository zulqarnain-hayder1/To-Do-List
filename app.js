
const STORAGE_KEY = 'Dynamic_Todo_List_App';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskTemplate = document.getElementById('task-template');
const countEl = document.getElementById('count');
const filterEl = document.getElementById('filter');
const clearCompletedBtn = document.getElementById('clear-completed');

let tasks = [];


function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load tasks', e);
    tasks = [];
  }
}

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}


function render() {
  taskList.innerHTML = '';
  const filter = filterEl.value;
  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  for (const t of filtered) {
    const node = taskTemplate.content.cloneNode(true);
    const li = node.querySelector('li');
    const titleEl = node.querySelector('.task-title');
    const toggle = node.querySelector('.toggle');
    const editBtn = node.querySelector('.edit');
    const delBtn = node.querySelector('.delete');

    li.dataset.id = t.id;
    titleEl.textContent = t.title;
    toggle.checked = !!t.completed;
    if (t.completed) li.classList.add('completed');

    
    toggle.addEventListener('change', () => {
      t.completed = toggle.checked;
      save();
      render();
    });

    
    delBtn.addEventListener('click', () => {
      tasks = tasks.filter(x => x.id !== t.id);
      save();
      render();
    });

    
    editBtn.addEventListener('click', () => {
      const newText = prompt('Edit task', t.title);
      if (newText === null) return; 
      const trimmed = newText.trim();
      if (!trimmed) {
        if (confirm('Empty title — delete this task?')) {
          tasks = tasks.filter(x => x.id !== t.id);
        }
      } else {
        t.title = trimmed;
      }
      save();
      render();
    });

    
    titleEl.addEventListener('dblclick', () => editBtn.click());

    taskList.appendChild(node);
  }

  
  const total = tasks.length;
  const active = tasks.filter(t => !t.completed).length;
  countEl.textContent = total === 1 ? (active + ' active, 1 total') : (active + ' active, ' + total + ' total');
}


taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.value = '';
    return;
  }
  const newTask = { id: uuid(), title: text, completed: false, createdAt: Date.now() };
  tasks.unshift(newTask); 
  taskInput.value = '';
  save();
  render();
});

filterEl.addEventListener('change', render);

clearCompletedBtn.addEventListener('click', () => {
  if (!tasks.some(t => t.completed)) return alert('No completed tasks to clear.');
  if (!confirm('Clear all completed tasks?')) return;
  tasks = tasks.filter(t => !t.completed);
  save();
  render();
});

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== taskInput) {
    e.preventDefault();
    taskInput.focus();
  }
});


load();
render();
