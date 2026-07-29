document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const taskCounter = document.getElementById('task-counter');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Load tasks from Local Storage or default to an empty array
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentFilter = 'all';

  // --- Save to Local Storage ---
  function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // --- Render Tasks ---
  function renderTodos() {
    todoList.innerHTML = '';

    // Filter tasks based on current tab selection
    const filteredTodos = todos.filter(todo => {
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true; // 'all'
    });

    // Generate list HTML
    filteredTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.dataset.id = todo.id;

      li.innerHTML = `
        <div class="todo-content">
          <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''} 
          />
          <span class="todo-text">${escapeHTML(todo.text)}</span>
        </div>
        <button class="delete-btn" aria-label="Delete task">&times;</button>
      `;

      // Event listeners for individual items
      const checkbox = li.querySelector('.todo-checkbox');
      const deleteBtn = li.querySelector('.delete-btn');

      checkbox.addEventListener('change', () => toggleTodo(todo.id));
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

      todoList.appendChild(li);
    });

    updateCounter();
  }

  // --- Escape HTML to prevent XSS ---
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // --- Add New Task ---
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();

    if (text !== '') {
      const newTodo = {
        id: Date.now().toString(),
        text: text,
        completed: false
      };

      todos.push(newTodo);
      saveToLocalStorage();
      renderTodos();
      todoInput.value = '';
    }
  });

  // --- Toggle Completion ---
  function toggleTodo(id) {
    todos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    saveToLocalStorage();
    renderTodos();
  }

  // --- Delete Task ---
  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveToLocalStorage();
    renderTodos();
  }

  // --- Update Counter ---
  function updateCounter() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    taskCounter.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`;
  }

  // --- Filter Event Listeners ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // --- Clear Completed Tasks ---
  clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveToLocalStorage();
    renderTodos();
  });

  // Initial render on page load
  renderTodos();
});