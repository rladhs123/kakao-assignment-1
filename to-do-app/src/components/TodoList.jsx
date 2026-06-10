import TodoItem from './TodoItem';

// Todo 목록 전체를 담당하는 컴포넌트입니다.
// App.jsx에서 필터링이 끝난 todos 배열을 받고, 각 Todo와 이벤트 함수를 TodoItem으로 전달합니다.
function TodoList({ todos, onEditTodo, onToggleTodo, onDeleteTodo }) {
  if (todos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        표시할 Todo가 없습니다.
      </div>
    );
  }

  return (
    <ul className="space-y-2.5" aria-label="Todo 목록">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onEditTodo={onEditTodo}
          onToggleTodo={onToggleTodo}
          onDeleteTodo={onDeleteTodo}
        />
      ))}
    </ul>
  );
}

export default TodoList;
