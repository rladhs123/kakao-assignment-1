import Link from "next/link";
import { createTodo } from "../../actions";
import SubmitButton from "../submit-button";

export default function NewTodoPage() {
  return (
    <main className="page-shell">
      <section className="form-panel">
        <p className="eyebrow">New task</p>
        <h1>Todo 생성</h1>
        <form action={createTodo} className="todo-form">
          <label htmlFor="title">제목</label>
          <input id="title" name="title" type="text" placeholder="할 일을 입력하세요" required autoFocus />
          <div className="form-actions">
            <Link className="button button-secondary" href="/todos">취소</Link>
            <SubmitButton className="button button-primary" pendingText="생성 중...">생성</SubmitButton>
          </div>
        </form>
      </section>
    </main>
  );
}
