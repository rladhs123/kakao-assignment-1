import Link from "next/link";
import { deleteTodo, getTodos, toggleTodo } from "../actions";
import type { TodoFilter } from "./api";
import SearchBox from "./search-box";
import SubmitButton from "./submit-button";

const filters: Array<{ label: string; value: TodoFilter }> = [
  { label: "전체", value: "all" },
  { label: "진행 중", value: "active" },
  { label: "완료", value: "completed" },
];

type TodosPageProps = {
  searchParams: Promise<{ filter?: string; search?: string }>;
};

function normalizeFilter(filter?: string): TodoFilter {
  if (filter === "active" || filter === "completed") return filter;
  return "all";
}

function getEmptyMessage(filter: TodoFilter) {
  if (filter === "active") return "진행 중인 Todo가 없습니다.";
  if (filter === "completed") return "완료한 Todo가 없습니다.";
  return "등록된 Todo가 없습니다.";
}

function getFilterHref(filter: TodoFilter, search: string) {
  const params = new URLSearchParams();

  if (filter !== "all") params.set("filter", filter);
  if (search) params.set("search", search);

  const query = params.toString();
  return query ? `/todos?${query}` : "/todos";
}

export default async function TodosPage({ searchParams }: TodosPageProps) {
  const { filter: filterParam, search: searchParam } = await searchParams;
  const currentFilter = normalizeFilter(filterParam);
  const search = searchParam?.trim() ?? "";
  const todos = await getTodos({ filter: currentFilter, search });

  return (
    <main className="page-shell">
      <section className="todo-panel">
        <header className="page-header">
          <div>
            <p className="eyebrow">Next.js + FastAPI</p>
            <h1>Todo 목록</h1>
          </div>
          <Link className="button button-primary" href="/todos/new">새 Todo</Link>
        </header>

        <nav className="filter-tabs" aria-label="Todo 필터">
          {filters.map((filter) => (
            <Link
              aria-current={currentFilter === filter.value ? "page" : undefined}
              className={currentFilter === filter.value ? "filter-tab active" : "filter-tab"}
              href={getFilterHref(filter.value, search)}
              key={filter.value}
            >
              {filter.label}
            </Link>
          ))}
        </nav>

        <SearchBox defaultValue={search} key={search} />

        {todos.length === 0 ? (
          <div className="empty-state">
            <p>{getEmptyMessage(currentFilter)}</p>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li className="todo-item" key={todo.id}>
                <div className="todo-content">
                  <span aria-label={todo.completed ? "완료" : "진행 중"} className={`status-dot ${todo.completed ? "completed" : ""}`} />
                  <span className={todo.completed ? "todo-title completed" : "todo-title"}>{todo.title}</span>
                </div>
                <div className="todo-actions">
                  <form action={toggleTodo.bind(null, todo.id, todo.title, todo.completed)}>
                    <SubmitButton className="button button-success" pendingText="처리 중...">
                      {todo.completed ? "되돌리기" : "완료"}
                    </SubmitButton>
                  </form>
                  <Link className="button button-secondary" href={`/todos/${todo.id}`}>수정</Link>
                  <form action={deleteTodo.bind(null, todo.id)}>
                    <SubmitButton className="button button-danger" pendingText="삭제 중...">삭제</SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
