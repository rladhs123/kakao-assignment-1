import { useState } from 'react';

// Todo 입력창과 추가 버튼을 담당하는 컴포넌트입니다.
// 입력값은 이 컴포넌트 안에서만 관리하고, submit 시 App.jsx에서 받은 onAddTodo 함수로 값을 전달합니다.
function TodoForm({ onAddTodo }) {
  const [todoText, setTodoText] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    onAddTodo(todoText);
    setTodoText('');
  }

  return (
    <form className="mb-5 grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="todo-input">
        새 Todo 입력
      </label>
      <input
        id="todo-input"
        type="text"
        value={todoText}
        onChange={(event) => setTodoText(event.target.value)}
        className="min-w-0 rounded-lg border border-transparent bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        placeholder="할 일을 입력하세요"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
      >
        추가
      </button>
    </form>
  );
}

export default TodoForm;
