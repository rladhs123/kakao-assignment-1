// Todo 한 개 항목을 담당하는 컴포넌트입니다.
// 버튼을 누르면 직접 상태를 바꾸지 않고, App.jsx에서 받은 함수에 todo.id를 전달해 변경을 요청합니다.
function TodoItem({ todo, onEditTodo, onToggleTodo, onDeleteTodo }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <span
        className={
          todo.completed
            ? 'min-w-0 break-words leading-relaxed text-slate-400 line-through'
            : 'min-w-0 break-words leading-relaxed text-slate-800'
        }
      >
        {todo.text}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEditTodo(todo.id)}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => onToggleTodo(todo.id)}
          className={
            todo.completed
              ? 'rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900'
              : 'rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100'
          }
        >
          {todo.completed ? '취소' : '완료'}
        </button>
        <button
          type="button"
          onClick={() => onDeleteTodo(todo.id)}
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          삭제
        </button>
      </div>
    </li>
  );
}

export default TodoItem;
