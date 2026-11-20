// filters.js — 담당: 팀원 B (Issue #6)
// 보기 방식(분류별 / 중요도별 / 완료)에 따라 할 일을 칸(열)으로 나눈다.

const GROUPS = {
  priority: ['urgent', 'important', 'none', 'later'],
  category: ['study', 'personal', 'family', 'other']
};

// 돌려주는 값: [{ key, label, tasks }, ...]  — 칸 하나가 객체 하나
function groupTasks(list, mode) {
  if (mode === 'done') {
    const done = list.filter(function (t) { return t.completed; });
    return [{ key: 'done', label: '완료', tasks: done }];
  }
  const field = mode === 'category' ? 'category' : 'priority';
  const labels = field === 'category' ? CATEGORY_LABEL : PRIORITY_LABEL;
  return GROUPS[field].map(function (key) {
    const inColumn = list.filter(function (t) { return !t.completed && t[field] === key; });
    return { key: key, label: labels[key], tasks: inColumn };
  });
}
