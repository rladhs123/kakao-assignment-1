import Link from "next/link";
import { notFound } from "next/navigation";
import { getTodos, updateTodo } from "../../actions";
import SubmitButton from "../submit-button";

type EditTodoPageProps = { params: Promise<{ todoId: string }> };

export default async function EditTodoPage({ params }: EditTodoPageProps) {
  const { todoId } = await params;
  const id = Number(todoId);
  const todos = await getTodos();
  const todo = todos.find((item) => item.id === id);

  if (!Number.isInteger(id) || !todo) notFound();

  return (
    <main className="page-shell">
      <section className="form-panel">
        <p className="eyebrow">Task #{todo.id}</p>
        <h1>Todo 수정</h1>
        <form action={updateTodo.bind(null, todo.id)} className="todo-form">
          <label htmlFor="title">제목</label>
          <input id="title" name="title" type="text" defaultValue={todo.title} required />
          <div className="form-actions">
            <Link className="button button-secondary" href="/todos">취소</Link>
            <SubmitButton className="button button-primary" pendingText="저장 중...">저장</SubmitButton>
          </div>
        </form>
      </section>
    </main>
  );
}
