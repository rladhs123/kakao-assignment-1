import { createDateKey, getWeekDates } from '../utils/date';

// 월요일부터 일요일까지의 주간 날짜 목록을 담당하는 컴포넌트입니다.
// App.jsx에서 selectedDate, 날짜 변경 함수, 전체 todos를 받아 날짜별 Todo 개수와 선택 상태를 표시합니다.
function WeeklyView({ selectedDate, todos, onSelectDate, onMoveWeek }) {
  const weekDates = getWeekDates(selectedDate);
  const selectedDateKey = createDateKey(selectedDate);
  const todayDateKey = createDateKey(new Date());
  const weekStartDate = weekDates[0];
  const weekEndDate = weekDates[6];

  function countTodosByDate(dateKey) {
    return todos.filter((todo) => todo.date === dateKey).length;
  }

  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4" aria-label="주간 Todo 보기">
      <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <button
          type="button"
          onClick={() => onMoveWeek(-7)}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
        >
          이전 주
        </button>

        <p className="text-center text-sm font-bold text-slate-700">
          {weekStartDate.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
          })}{' '}
          -{' '}
          {weekEndDate.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <button
          type="button"
          onClick={() => onMoveWeek(7)}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
        >
          다음 주
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 rounded-xl bg-slate-50 p-2">
        {weekDates.map((weekDate) => {
          const weekDateKey = createDateKey(weekDate);
          const isSelected = weekDateKey === selectedDateKey;
          const isToday = weekDateKey === todayDateKey;
          const todoCount = countTodosByDate(weekDateKey);

          return (
            <button
              key={weekDateKey}
              type="button"
              onClick={() => onSelectDate(weekDate)}
              className={[
                'min-h-20 rounded-lg border px-2 py-2 text-center transition',
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-transparent bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50',
                isToday && !isSelected ? 'border-amber-300 bg-amber-50 text-amber-800' : '',
              ].join(' ')}
              aria-pressed={isSelected}
              aria-label={`${weekDateKey} Todo ${todoCount}개`}
            >
              <span className="block text-xs font-semibold">
                {weekDate.toLocaleDateString('ko-KR', {
                  weekday: 'short',
                })}
              </span>
              <span className="mt-1 block text-lg font-bold">{weekDate.getDate()}</span>
              <span className="mt-1 block text-xs">{todoCount}개</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default WeeklyView;
