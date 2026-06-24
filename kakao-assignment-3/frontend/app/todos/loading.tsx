export default function TodosLoading() {
  return (
    <main className="page-shell" aria-busy="true" aria-label="Todo 목록 로딩 중">
      <section className="todo-panel">
        <div className="loading-heading skeleton" />
        <div className="loading-list">
          {[1, 2, 3].map((item) => <div className="loading-item skeleton" key={item} />)}
        </div>
      </section>
    </main>
  );
}
