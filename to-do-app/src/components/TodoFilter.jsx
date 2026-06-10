const filterButtons = [
  {
    label: '전체',
    value: 'all',
  },
  {
    label: '진행 중',
    value: 'active',
  },
  {
    label: '완료',
    value: 'completed',
  },
];

// 전체 / 진행 중 / 완료 분류 UI를 담당하는 컴포넌트입니다.
// 어떤 필터가 선택되었는지는 App.jsx의 currentFilter 상태가 내려오고, 클릭하면 onChangeFilter로 변경 요청을 올립니다.
function TodoFilter({ currentFilter, onChangeFilter }) {
  return (
    <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1.5" aria-label="Todo 상태 필터">
      {filterButtons.map((filterButton) => {
        const isSelected = currentFilter === filterButton.value;

        return (
          <button
            key={filterButton.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChangeFilter(filterButton.value)}
            className={
              isSelected
                ? 'rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm'
                : 'rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900'
            }
          >
            {filterButton.label}
          </button>
        );
      })}
    </div>
  );
}

export default TodoFilter;
