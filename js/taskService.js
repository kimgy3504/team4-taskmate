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

// F02 할 일 수정
function updateTask(id, changes) {
  const task = findTask(id);
  if (!task) return { ok: false, message: '해당 할 일을 찾을 수 없습니다.' };
  const title = String(changes.title || '').trim();
  if (title === '') return { ok: false, message: '할 일 제목을 입력하세요.' };
  Object.assign(task, { title: title, priority: changes.priority, category: changes.category,
    startDate: changes.startDate, dueDate: changes.dueDate, memo: changes.memo }, {
    subtasks: makeSubtasks(changes.subtasks, task.subtasks),
    updatedAt: new Date().toISOString()
  });
  saveTasks(tasks);
  return { ok: true, task: task };
}

// F03 할 일 삭제
function deleteTask(id) {
  const before = tasks.length;
  tasks = tasks.filter(function (t) { return t.id !== id; });
  saveTasks(tasks);
  return { ok: tasks.length < before };
}

// F04 완료 / 미완료 전환
function toggleTask(id) {
  const task = findTask(id);
  if (!task) return { ok: false };
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  return { ok: true, task: task };
}

// F07 세부 할 일 완료 / 취소 전환
function toggleSubtask(id, subId) {
  const task = findTask(id);
  const sub = task && task.subtasks.find(function (s) { return s.id === subId; });
  if (!sub) return { ok: false };
  sub.done = !sub.done;
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  return { ok: true, task: task };
}

