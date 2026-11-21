// taskService.js — 담당: 팀원 A (Issue #2, #3, #4)
// 할 일 데이터의 추가·조회·수정·삭제(CRUD)와 입력값 검증을 맡는다.
// 화면(ui.js)은 이 파일의 함수만 호출하고, 데이터를 직접 고치지 않는다.

const PRIORITIES = ['urgent', 'important', 'none', 'later'];
const CATEGORIES = ['study', 'personal', 'family', 'other'];
const MAX_TITLE = 80;

let tasks = loadTasks();

// 목록 복사본을 돌려준다. (원본이 화면 쪽에서 바뀌지 않도록)
function getTasks() {
  return tasks.slice();
}

// id로 할 일 하나 찾기 (없으면 undefined)
function findTask(id) {
  return tasks.find(function (t) { return t.id === id; });
}

// 제목 검증: 앞뒤 공백 제거, 빈 값 금지, 80자 제한
function validateTitle(title) {
  const value = String(title || '').trim();
  if (value === '') return { ok: false, message: '할 일 제목을 입력하세요.' };
  if (value.length > MAX_TITLE) {
    return { ok: false, message: '제목은 80자까지 입력할 수 있습니다.' };
  }
  return { ok: true, value: value };
}

// 중요도·분류·날짜·메모를 정해진 값으로 맞춘다. (Issue #4)
function normalizeMeta(input) {
  const date = /^\d{4}-\d{2}-\d{2}$/;
  return {
    priority: PRIORITIES.includes(input.priority) ? input.priority : 'none',
    category: CATEGORIES.includes(input.category) ? input.category : 'personal',
    startDate: date.test(input.startDate || '') ? input.startDate : '',
    dueDate: date.test(input.dueDate || '') ? input.dueDate : '',
    memo: String(input.memo || '').trim()
  };
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
  const check = validateTitle(input.title);
  if (!check.ok) return check;
  const now = new Date().toISOString();
  const task = Object.assign(
    { id: makeId(), title: check.value, completed: false },
    normalizeMeta(input),
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
  const check = validateTitle(changes.title);
  if (!check.ok) return check;
  Object.assign(task, { title: check.value }, normalizeMeta(changes), {
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

// F08 마감일이 지난 미완료 항목인지 확인 (today 형식: YYYY-MM-DD)
function isOverdue(task, today) {
  return !task.completed && task.dueDate !== '' && task.dueDate < today;
}
