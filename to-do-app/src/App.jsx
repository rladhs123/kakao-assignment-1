import { useState } from 'react';
import TodoFilter from './components/TodoFilter';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import WeeklyView from './components/WeeklyView';
import { createDateKey } from './utils/date';

const FILTER_OPTIONS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const TODO_STORAGE_KEY = 'reactTodoAppTodos';
const todayDateKey = createDateKey(new Date());

const initialTodos = [
  {
    id: 1,
    text: 'React 컴포넌트 구조 잡기',
    date: todayDateKey,
    completed: false,
  },
  {
    id: 2,
    text: 'Todo 목록 UI 확인하기',
    date: todayDateKey,
    completed: true,
  },
  {
    id: 3,
    text: '수정, 완료, 삭제 버튼 배치하기',
    date: todayDateKey,
    completed: false,
  },
];

// 로컬 스토리지에 저장된 Todo JSON 문자열을 배열로 복원합니다.
// 저장된 값이 없으면 기본 예시 Todo를 사용해 첫 화면이 비어 보이지 않도록 합니다.
function loadTodosFromLocalStorage() {
  const savedTodos = localStorage.getItem(TODO_STORAGE_KEY);

  if (!savedTodos) {
    return initialTodos;
  }

  try {
    const parsedTodos = JSON.parse(savedTodos);

    // 이전 단계에서 저장된 Todo에는 date 값이 없을 수 있으므로 오늘 날짜로 보정합니다.
    return parsedTodos.map((todo) => ({
      ...todo,
      date: todo.date ?? todayDateKey,
    }));
  } catch {
    return initialTodos;
  }
}

// Todo 배열을 JSON 문자열로 변환해 로컬 스토리지에 저장합니다.
// Todo 추가, 수정, 삭제, 완료 처리 후 이 함수를 호출해야 새로고침해도 최신 목록이 유지됩니다.
function saveTodosToLocalStorage(nextTodos) {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(nextTodos));
}

function App() {
  // todos는 앱의 핵심 데이터입니다. Todo 추가, 수정, 삭제, 완료 처리는 모두 이 상태를 변경합니다.
  // useState에 함수를 전달하면 첫 렌더링 때 한 번만 로컬 스토리지 데이터를 읽습니다.
  const [todos, setTodos] = useState(loadTodosFromLocalStorage);

  // selectedDate는 주간 뷰에서 클릭한 날짜와 Todo 생성 날짜를 연결하는 상태입니다.
  const [selectedDate, setSelectedDate] = useState(new Date());

  // currentFilter는 Todo 목록을 어떤 기준으로 보여줄지 저장합니다.
  // 전체, 진행 중, 완료 버튼을 누르면 이 값이 바뀌고 화면에 보이는 목록도 함께 바뀝니다.
  const [currentFilter, setCurrentFilter] = useState(FILTER_OPTIONS.ALL);

  // 입력값이 비어 있을 때 사용자에게 보여줄 안내 메시지입니다.
  const [message, setMessage] = useState('');

  // TodoForm에서 전달한 텍스트를 받아 새로운 Todo 객체를 만들고 todos 상태에 추가합니다.
  function addTodo(todoText) {
    const trimmedText = todoText.trim();
    const selectedDateKey = createDateKey(selectedDate);

    if (!trimmedText) {
      setMessage('할 일을 입력해 주세요.');
      return;
    }

    // 같은 날짜 안에서 같은 텍스트의 Todo가 이미 있는지 확인합니다.
    // 다른 날짜에는 같은 할 일을 다시 등록할 수 있도록 날짜와 텍스트를 함께 비교합니다.
    const hasDuplicatedTodo = todos.some(
      (todo) => todo.date === selectedDateKey && todo.text.trim().toLowerCase() === trimmedText.toLowerCase(),
    );

    if (hasDuplicatedTodo) {
      setMessage('이미 같은 할 일이 있습니다.');
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: trimmedText,
      date: selectedDateKey,
      completed: false,
    };
    const nextTodos = [newTodo, ...todos];

    setTodos(nextTodos);
    saveTodosToLocalStorage(nextTodos);
    setMessage('');
  }

  // TodoItem에서 수정 버튼을 누르면 prompt로 새 텍스트를 입력받아 해당 Todo만 수정합니다.
  function editTodo(todoId) {
    const targetTodo = todos.find((todo) => todo.id === todoId);

    if (!targetTodo) {
      return;
    }

    const editedText = prompt('수정할 내용을 입력하세요.', targetTodo.text);

    if (editedText === null) {
      return;
    }

    const trimmedText = editedText.trim();

    if (!trimmedText) {
      setMessage('수정할 내용을 입력해 주세요.');
      return;
    }

    const nextTodos = todos.map((todo) =>
      todo.id === todoId
        ? {
            ...todo,
            text: trimmedText,
          }
        : todo,
    );

    setTodos(nextTodos);
    saveTodosToLocalStorage(nextTodos);
    setMessage('');
  }

  // TodoItem에서 완료 버튼을 누르면 해당 Todo의 completed 값을 반대로 바꿉니다.
  function toggleTodoCompleted(todoId) {
    const nextTodos = todos.map((todo) =>
      todo.id === todoId
        ? {
            ...todo,
            completed: !todo.completed,
          }
        : todo,
    );

    setTodos(nextTodos);
    saveTodosToLocalStorage(nextTodos);
    setMessage('');
  }

  // TodoItem에서 삭제 버튼을 누르면 해당 id를 가진 Todo를 목록에서 제거합니다.
  function deleteTodo(todoId) {
    const nextTodos = todos.filter((todo) => todo.id !== todoId);

    setTodos(nextTodos);
    saveTodosToLocalStorage(nextTodos);
    setMessage('');
  }

  // 이전 주 / 다음 주 버튼은 선택 날짜를 7일씩 이동시켜 주간 뷰와 Todo 목록을 함께 바꿉니다.
  function moveSelectedWeek(dayOffset) {
    setSelectedDate((currentSelectedDate) => {
      const nextSelectedDate = new Date(currentSelectedDate);
      nextSelectedDate.setDate(nextSelectedDate.getDate() + dayOffset);

      return nextSelectedDate;
    });
    setMessage('');
  }

  // 선택된 날짜와 currentFilter 값에 따라 화면에 보여줄 Todo 목록만 계산합니다.
  // 원본 todos는 그대로 두고, 렌더링에 사용할 배열만 날짜와 상태 기준으로 분류해서 TodoList로 전달합니다.
  const selectedDateKey = createDateKey(selectedDate);
  const filteredTodos = todos.filter((todo) => {
    if (todo.date !== selectedDateKey) {
      return false;
    }

    if (currentFilter === FILTER_OPTIONS.ACTIVE) {
      return !todo.completed;
    }

    if (currentFilter === FILTER_OPTIONS.COMPLETED) {
      return todo.completed;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <section className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-7 border-b border-slate-100 pb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-600">Daily Tasks</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Todo App</h1>
          <p className="mt-2 text-sm text-slate-500">날짜별 할 일을 정리하고 진행 상태를 확인하세요.</p>
        </header>

        {/* TodoForm은 입력 UI를 담당하고, 실제 Todo 추가는 App.jsx의 addTodo 함수로 요청합니다. */}
        <TodoForm onAddTodo={addTodo} />

        {message && (
          <p className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {message}
          </p>
        )}

        {/* WeeklyView는 날짜 선택 UI를 담당하고, 선택된 날짜는 App.jsx의 selectedDate 상태로 관리합니다. */}
        <WeeklyView
          selectedDate={selectedDate}
          todos={todos}
          onSelectDate={setSelectedDate}
          onMoveWeek={moveSelectedWeek}
        />

        {/* TodoFilter는 분류 UI를 담당하고, 선택된 필터 값을 App.jsx의 currentFilter 상태로 반영합니다. */}
        <TodoFilter currentFilter={currentFilter} onChangeFilter={setCurrentFilter} />

        {/* TodoList는 분류된 Todo 목록과 각 Todo에 필요한 이벤트 함수를 TodoItem으로 다시 전달합니다. */}
        <TodoList
          todos={filteredTodos}
          onEditTodo={editTodo}
          onToggleTodo={toggleTodoCompleted}
          onDeleteTodo={deleteTodo}
        />
      </section>
    </main>
  );
}

export default App;
