const input = document.querySelector("input");
const addButton = document.querySelector(".add-button");
const todosHtml = document.querySelector(".todos");
const emptyImage = document.querySelector(".empty-image");
let todosJson = JSON.parse(localStorage.getItem("todos")) || [];
const deleteAllButton = document.querySelector(".delete-all");
const filters = document.querySelectorAll(".filter");
let filter = '';

showTodos();

function getTodoHtml(todo, index) {
  if (filter && filter != todo.status) {
    return '';
  }
  let checked = todo.status == "completed" ? "checked" : "";
  return /* html */ `
    <li class="todo" draggable="true" data-index="${index}" 
        ondragstart="handleDragStart(event)" 
        ondragover="handleDragOver(event)" 
        ondrop="handleDrop(event)" 
        ondragend="handleDragEnd(event)">
      <label for="${index}">
        <input id="${index}" onclick="updateStatus(this)" type="checkbox" ${checked}>
        <span class="editable ${checked}" data-index="${index}" contenteditable="false">${todo.name}</span>
      </label>
      <div>
        <button class="edit-btn" data-index="${index}" onclick="enableEdit(this)"><i class="fa fa-pencil"></i></button>
        <button class="delete-btn" data-index="${index}" onclick="remove(this)"><i class="fa fa-times"></i></button>
      </div>
    </li>
  `;
}


function showTodos() {
  if (todosJson.length == 0) {
    todosHtml.innerHTML = '';
    emptyImage.style.display = 'block';
  } else {
    todosHtml.innerHTML = todosJson.map(getTodoHtml).join('');
    emptyImage.style.display = 'none';
  }
}

function addTodo(todo)  {
  input.value = "";
  todosJson.unshift({ name: todo, status: "pending" });
  localStorage.setItem("todos", JSON.stringify(todosJson));
  showTodos();
}

input.addEventListener("keyup", e => {
  let todo = input.value.trim();
  if (!todo || e.key != "Enter") {
    return;
  }
  addTodo(todo);
});

addButton.addEventListener("click", () => {
  let todo = input.value.trim();
  if (!todo) {
    return;
  }
  addTodo(todo);
});

function updateStatus(todo) {
  let todoName = todo.parentElement.lastElementChild;
  if (todo.checked) {
    todoName.classList.add("checked");
    todosJson[todo.id].status = "completed";
  } else {
    todoName.classList.remove("checked");
    todosJson[todo.id].status = "pending";
  }
  localStorage.setItem("todos", JSON.stringify(todosJson));
}

function remove(todo) {
  const index = todo.dataset.index;
  todosJson.splice(index, 1);
  showTodos();
  localStorage.setItem("todos", JSON.stringify(todosJson));
}

filters.forEach(function (el) {
  el.addEventListener("click", (e) => {
    if (el.classList.contains('active')) {
      el.classList.remove('active');
      filter = '';
    } else {
      filters.forEach(tag => tag.classList.remove('active'));
      el.classList.add('active');
      filter = e.target.dataset.filter;
    }
    showTodos();
  });
});

deleteAllButton.addEventListener("click", () => {
  todosJson = [];
  localStorage.setItem("todos", JSON.stringify(todosJson));
  showTodos();
});

function enableEdit(button) {
  const index = button.dataset.index;
  const taskElement = document.querySelector(`span.editable[data-index="${index}"]`);

  // Activer l'édition
  taskElement.contentEditable = "true";
  taskElement.classList.add("editing");

  // Placer le curseur à la fin du texte
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(taskElement);
  range.collapse(false); // Placer le curseur à la fin
  sel.removeAllRanges();
  sel.addRange(range);

  taskElement.focus();

  // Gérer la validation avec "Entrée"
  taskElement.onkeydown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Empêche le saut de ligne
      saveEdit(taskElement, index);
    }
  };

  // Désactiver l'édition lors du blur
  taskElement.onblur = () => {
    saveEdit(taskElement, index);
  };
}

// Fonction pour sauvegarder l'édition
function saveEdit(taskElement, index) {
  taskElement.contentEditable = "false";
  taskElement.classList.remove("editing");

  // Enregistrer les modifications
  todosJson[index].name = taskElement.textContent.trim();
  localStorage.setItem("todos", JSON.stringify(todosJson));

  // Mettre à jour l'affichage
  showTodos();
}


let draggedItemIndex = null;

// Début du glissement
function handleDragStart(event) {
  draggedItemIndex = event.target.dataset.index;
  event.target.classList.add('dragging');
}

// Lorsqu'un élément est survolé pendant le glissement
function handleDragOver(event) {
  event.preventDefault(); // Nécessaire pour permettre le drop
  const target = event.target.closest('.todo');
  if (target && target.dataset.index !== draggedItemIndex) {
    const draggingItem = document.querySelector('.dragging');
    const targetIndex = target.dataset.index;

    // Insérez l'élément déplacé avant ou après la cible
    const todosContainer = document.querySelector('.todos');
    if (targetIndex > draggedItemIndex) {
      todosContainer.insertBefore(draggingItem, target.nextSibling);
    } else {
      todosContainer.insertBefore(draggingItem, target);
    }
  }
}

// Lorsque l'élément est déposé
function handleDrop(event) {
  event.preventDefault();
  const targetIndex = event.target.closest('.todo').dataset.index;

  // Réorganisez les tâches dans `todosJson`
  const draggedItem = todosJson.splice(draggedItemIndex, 1)[0];
  todosJson.splice(targetIndex, 0, draggedItem);

  // Sauvegardez dans localStorage et mettez à jour l'affichage
  localStorage.setItem('todos', JSON.stringify(todosJson));
  showTodos();
}

// Fin du glissement
function handleDragEnd(event) {
  event.target.classList.remove('dragging');
  draggedItemIndex = null;
}
