const form = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const feedback = document.getElementById('feedback');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');

let tasks = JSON.parse(localStorage.getItem('oibsipTasks') || '[]');

function createId(){
    return crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveTasks(){
    localStorage.setItem('oibsipTasks', JSON.stringify(tasks));
}

function formatDate(value){
    return new Date(value).toLocaleString();
}

function renderTask(task){
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="task-title">${task.title}</span>
        <span class="meta">Added: ${formatDate(task.createdAt)}${task.completedAt ? ` | Completed: ${formatDate(task.completedAt)}` : ''}</span>
        <div class="actions">
            <button class="edit" data-action="edit" data-id="${task.id}">Edit</button>
            <button class="complete" data-action="toggle" data-id="${task.id}">${task.completed ? 'Move Pending' : 'Complete'}</button>
            <button class="delete" data-action="delete" data-id="${task.id}">Delete</button>
        </div>
    `;
    return li;
}

function render(){
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    const pending = tasks.filter(task => !task.completed);
    const completed = tasks.filter(task => task.completed);

    if(!pending.length){
        pendingList.innerHTML = '<li class="empty">No pending tasks.</li>';
    }

    if(!completed.length){
        completedList.innerHTML = '<li class="empty">No completed tasks yet.</li>';
    }

    pending.forEach(task => pendingList.appendChild(renderTask(task)));
    completed.forEach(task => completedList.appendChild(renderTask(task)));
}

form.addEventListener('submit', function(event){
    event.preventDefault();
    const title = taskInput.value.trim();
    feedback.textContent = '';

    if(!title){
        feedback.textContent = 'Please enter a task.';
        return;
    }

    tasks.unshift({
        id: createId(),
        title,
        completed:false,
        createdAt:new Date().toISOString(),
        completedAt:null
    });

    taskInput.value = '';
    saveTasks();
    render();
});

document.addEventListener('click', function(event){
    const button = event.target.closest('button[data-action]');
    if(!button) return;

    const task = tasks.find(item => item.id === button.dataset.id);
    if(!task) return;

    if(button.dataset.action === 'toggle'){
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
    }

    if(button.dataset.action === 'delete'){
        tasks = tasks.filter(item => item.id !== task.id);
    }

    if(button.dataset.action === 'edit'){
        const updated = prompt('Edit task', task.title);
        if(updated && updated.trim()){
            task.title = updated.trim();
        }
    }

    saveTasks();
    render();
});

render();
