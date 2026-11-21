// progress.js — 담당: 팀원 B (Issue #7)
// 카드 하나의 진행률: 세부 할 일 중 끝낸 것의 비율.

// 진행률 = 끝낸 세부 할 일 ÷ 전체 세부 할 일 × 100. 세부 할 일이 없으면 0%.
function calcProgress(task) {
  const total = task.subtasks.length;
  const done = task.subtasks.filter(function (s) { return s.done; }).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done: done, total: total, percent: percent };
}

