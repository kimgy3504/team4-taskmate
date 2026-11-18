// taskService.js — 담당: 팀원 A (Issue #2)
// 할 일 데이터의 추가·조회·수정·삭제(CRUD)를 맡는다.
// 화면(ui.js)은 이 파일의 함수만 호출하고, 데이터를 직접 고치지 않는다.

let tasks = loadTasks();

// 목록 복사본을 돌려준다. (원본이 화면 쪽에서 바뀌지 않도록)
function getTasks() {
  return tasks.slice();
}

// id로 할 일 하나 찾기 (없으면 undefined)
function findTask(id) {
  return tasks.find(function (t) { return t.id === id; });
}

function makeId() {
  return 'task-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// 세부 할 일 만들기: 한 줄에 하나, 빈 줄은 버린다. 이미 있던 줄은 완료 상태를 유지한다.
function makeSubtasks(lines, old) {
  return (lines || [])
    .map(function (text) { return String(text).trim(); })
    .filter(function (text) { return text !== ''; })
    .map(function (text) {
      const same = (old || []).find(function (s) { return s.text === text; });
      return same || { id: makeId(), text: text, done: false };
    });
}

// F01 할 일 추가
function addTask(input) {
  const title = String(input.title || '').trim();
  if (title === '') return { ok: false, message: '할 일 제목을 입력하세요.' };
  const now = new Date().toISOString();
  const task = Object.assign(
    { id: makeId(), title: title, completed: false },
    { priority: input.priority || 'none', category: input.category || 'personal',
      startDate: input.startDate || '', dueDate: input.dueDate || '', memo: input.memo || '' },
    { subtasks: makeSubtasks(input.subtasks), createdAt: now, updatedAt: now }
  );
  tasks.push(task);
  saveTasks(tasks);
  return { ok: true, task: task };
}
