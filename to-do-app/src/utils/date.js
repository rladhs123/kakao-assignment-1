// Date 객체를 Todo 저장과 비교에 사용할 YYYY-MM-DD 문자열로 바꿉니다.
// 로컬 스토리지에는 Date 객체가 아닌 문자열로 저장해야 비교와 복원이 단순합니다.
export function createDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// YYYY-MM-DD 문자열을 다시 Date 객체로 바꿉니다.
// 주간 날짜 버튼을 클릭했을 때 selectedDate 상태를 갱신하는 데 사용합니다.
export function createDateFromKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

// 선택된 날짜가 속한 주의 월요일을 계산합니다.
// getDay()는 일요일을 0으로 반환하므로, 일요일은 6일 전으로 이동해야 월요일이 됩니다.
export function getWeekStartDate(date) {
  const weekStartDate = new Date(date);
  const day = weekStartDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  weekStartDate.setDate(weekStartDate.getDate() + mondayOffset);
  return weekStartDate;
}

// 월요일부터 일요일까지 7개의 날짜를 배열로 만듭니다.
// WeeklyView는 이 배열을 사용해 날짜 버튼 7개를 렌더링합니다.
export function getWeekDates(date) {
  const weekStartDate = getWeekStartDate(date);

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const weekDate = new Date(weekStartDate);
    weekDate.setDate(weekStartDate.getDate() + dayIndex);

    return weekDate;
  });
}
