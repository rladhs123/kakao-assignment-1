const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const message = document.querySelector("#message");
const filterTabs = document.querySelectorAll(".filter-tab");
const selectedDateText = document.querySelector("#selected-date");
const previousDateButton = document.querySelector("#previous-date-button");
const nextDateButton = document.querySelector("#next-date-button");
const weekRangeText = document.querySelector("#week-range");
const weekDays = document.querySelector("#week-days");
const previousWeekButton = document.querySelector("#previous-week-button");
const nextWeekButton = document.querySelector("#next-week-button");

const TODO_STORAGE_KEY = "dailyTodoAppTodos";

let todos = [];
let currentFilter = "all";
let selectedDate = new Date();

// 사용자에게 보여줄 안내 메시지를 한 곳에서 관리합니다.
function showMessage(messageText) {
  message.textContent = messageText;
}

// Todo마다 고유한 id를 만들어 수정, 완료, 삭제 대상을 정확히 찾습니다.
function createTodoId() {
  return Date.now().toString();
}

// todos 배열을 JSON 문자열로 변환해 로컬스토리지에 저장합니다.
function saveTodosToLocalStorage() {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
}

// 페이지가 열릴 때 로컬스토리지의 JSON 문자열을 배열로 복원합니다.
function loadTodosFromLocalStorage() {
  const savedTodos = localStorage.getItem(TODO_STORAGE_KEY);

  if (!savedTodos) {
    return [];
  }

  return JSON.parse(savedTodos);
}

// Date 객체를 Todo 저장과 비교에 사용할 YYYY-MM-DD 형식으로 변환합니다.
function createDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 저장된 날짜 키를 다시 Date 객체로 바꿔 주간 버튼에서 사용합니다.
function createDateFromKey(dateKey) {
  const dateParts = dateKey.split("-");
  const year = Number(dateParts[0]);
  const month = Number(dateParts[1]) - 1;
  const day = Number(dateParts[2]);

  return new Date(year, month, day);
}

// 선택된 날짜가 속한 주의 월요일을 계산합니다.
function getWeekStartDate(date) {
  const weekStartDate = new Date(date);
  const day = weekStartDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  weekStartDate.setDate(weekStartDate.getDate() + mondayOffset);
  return weekStartDate;
}

// 월요일부터 일요일까지 7개의 Date 객체를 만듭니다.
function getWeekDates(date) {
  const weekStartDate = getWeekStartDate(date);
  const weekDates = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const weekDate = new Date(weekStartDate);
    weekDate.setDate(weekStartDate.getDate() + dayIndex);
    weekDates.push(weekDate);
  }

  return weekDates;
}

// 특정 날짜에 저장된 전체 Todo 개수를 계산합니다.
function countTodosByDate(dateKey) {
  return todos.filter(function (todo) {
    return todo.date === dateKey;
  }).length;
}

// 선택된 날짜를 사용자가 읽기 쉬운 한국어 날짜로 표시합니다.
function updateSelectedDateText() {
  selectedDateText.textContent = selectedDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });
}

// 주간 범위와 각 날짜 버튼을 현재 선택 날짜에 맞춰 다시 그립니다.
function renderWeekView() {
  const weekDates = getWeekDates(selectedDate);
  const weekStartDate = weekDates[0];
  const weekEndDate = weekDates[6];
  const selectedDateKey = createDateKey(selectedDate);
  const todayDateKey = createDateKey(new Date());

  weekRangeText.textContent = `${weekStartDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric"
  })} - ${weekEndDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric"
  })}`;

  weekDays.innerHTML = "";

  weekDates.forEach(function (weekDate) {
    const weekDateKey = createDateKey(weekDate);
    const weekDayButton = document.createElement("button");
    const weekDayName = document.createElement("span");
    const weekDayNumber = document.createElement("span");
    const weekTodoCount = document.createElement("span");
    const isSelectedDate = weekDateKey === selectedDateKey;
    const isToday = weekDateKey === todayDateKey;

    weekDayButton.type = "button";
    weekDayButton.className = "week-day";
    weekDayButton.dataset.date = weekDateKey;
    weekDayButton.setAttribute("aria-label", `${weekDateKey} Todo ${countTodosByDate(weekDateKey)}개`);

    if (isSelectedDate) {
      weekDayButton.classList.add("selected");
    }

    if (isToday) {
      weekDayButton.classList.add("today");
    }

    weekDayName.className = "week-day-name";
    weekDayName.textContent = weekDate.toLocaleDateString("ko-KR", {
      weekday: "short"
    });

    weekDayNumber.className = "week-day-number";
    weekDayNumber.textContent = weekDate.getDate().toString();

    weekTodoCount.className = "week-todo-count";
    weekTodoCount.textContent = `${countTodosByDate(weekDateKey)}개`;

    weekDayButton.append(weekDayName, weekDayNumber, weekTodoCount);
    weekDays.append(weekDayButton);
  });
}

// 이전/다음 버튼을 눌렀을 때 선택 날짜를 하루 단위로 이동합니다.
function moveSelectedDate(dayOffset) {
  selectedDate.setDate(selectedDate.getDate() + dayOffset);
  showMessage("");
  renderTodos();
}

// 현재 선택된 날짜와 필터에 맞는 Todo만 목록에 표시합니다.
function getFilteredTodos() {
  const selectedDateKey = createDateKey(selectedDate);

  return todos.filter(function (todo) {
    const matchesSelectedDate = todo.date === selectedDateKey;
    const matchesActiveFilter = currentFilter === "active" && !todo.completed;
    const matchesCompletedFilter = currentFilter === "completed" && todo.completed;
    const matchesAllFilter = currentFilter === "all";

    return matchesSelectedDate && (matchesAllFilter || matchesActiveFilter || matchesCompletedFilter);
  });
}

// 선택된 필터 탭을 시각적으로 구분하고 접근성 상태도 함께 갱신합니다.
function updateFilterTabStyle() {
  filterTabs.forEach(function (filterTab) {
    const isSelected = filterTab.dataset.filter === currentFilter;

    filterTab.classList.toggle("active", isSelected);
    filterTab.setAttribute("aria-selected", isSelected.toString());
  });
}

// 현재 todos 배열을 기준으로 화면의 Todo 목록을 다시 그립니다.
function renderTodos() {
  todoList.innerHTML = "";
  updateSelectedDateText();
  renderWeekView();

  getFilteredTodos().forEach(function (todo) {
    const todoItem = document.createElement("li");
    todoItem.className = todo.completed ? "todo-item completed" : "todo-item";

    const todoText = document.createElement("span");
    todoText.className = "todo-text";
    todoText.textContent = todo.text;

    const actionGroup = document.createElement("div");
    actionGroup.className = "todo-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-button";
    editButton.textContent = "수정";
    editButton.addEventListener("click", function () {
      editTodo(todo.id);
    });

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "action-button";
    completeButton.textContent = todo.completed ? "취소" : "완료";
    completeButton.addEventListener("click", function () {
      toggleTodoCompleted(todo.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-button delete-button";
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", function () {
      deleteTodo(todo.id);
    });

    actionGroup.append(editButton, completeButton, deleteButton);
    todoItem.append(todoText, actionGroup);
    todoList.append(todoItem);
  });

  updateFilterTabStyle();
}

// 입력창의 값으로 새 Todo를 생성합니다.
function addTodo(todoText) {
  // 같은 날짜에 같은 텍스트의 Todo가 이미 있는지 확인해 중복 생성을 방지합니다.
  if (todos.some(todo => todo.text === todoText && todo.date === createDateKey(selectedDate))) {
    alert("이미 같은 할 일이 있습니다.");
    return;
  }

  todos.push({
    id: createTodoId(),
    text: todoText,
    date: createDateKey(selectedDate),
    completed: false
  });

  saveTodosToLocalStorage();
  renderTodos();
}

// prompt로 새 내용을 입력받아 Todo 텍스트를 수정합니다.
function editTodo(todoId) {
  const targetTodo = todos.find(function (todo) {
    return todo.id === todoId;
  });

  if (!targetTodo) {
    return;
  }

  const editedText = prompt("수정할 내용을 입력하세요.", targetTodo.text);

  if (editedText === null) {
    return;
  }

  const trimmedText = editedText.trim();

  if (!trimmedText) {
    showMessage("수정할 내용을 입력해 주세요.");
    return;
  }

  targetTodo.text = trimmedText;
  saveTodosToLocalStorage();
  showMessage("");
  renderTodos();
}

// 완료 버튼을 누를 때마다 완료 상태를 반대로 변경합니다.
function toggleTodoCompleted(todoId) {
  todos = todos.map(function (todo) {
    if (todo.id !== todoId) {
      return todo;
    }

    return {
      id: todo.id,
      text: todo.text,
      date: todo.date,
      completed: !todo.completed
    };
  });

  saveTodosToLocalStorage();
  showMessage("");
  renderTodos();
}

// 선택한 Todo를 목록에서 제거합니다.
function deleteTodo(todoId) {
  todos = todos.filter(function (todo) {
    return todo.id !== todoId;
  });

  saveTodosToLocalStorage();
  showMessage("");
  renderTodos();
}

todoForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const todoText = todoInput.value.trim();

  if (!todoText) {
    showMessage("할 일을 입력해 주세요.");
    return;
  }

  addTodo(todoText);
  todoInput.value = "";
  showMessage("");
  todoInput.focus();
});

filterTabs.forEach(function (filterTab) {
  filterTab.addEventListener("click", function () {
    currentFilter = filterTab.dataset.filter;
    showMessage("");
    renderTodos();
  });
});

previousDateButton.addEventListener("click", function () {
  moveSelectedDate(-1);
});

nextDateButton.addEventListener("click", function () {
  moveSelectedDate(1);
});

previousWeekButton.addEventListener("click", function () {
  moveSelectedDate(-7);
});

nextWeekButton.addEventListener("click", function () {
  moveSelectedDate(7);
});

weekDays.addEventListener("click", function (event) {
  const clickedWeekDay = event.target.closest(".week-day");

  if (!clickedWeekDay) {
    return;
  }

  selectedDate = createDateFromKey(clickedWeekDay.dataset.date);
  showMessage("");
  renderTodos();
});

todos = loadTodosFromLocalStorage();
renderTodos();
