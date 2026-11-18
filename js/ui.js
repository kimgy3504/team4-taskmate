// ui.js — 담당: 팀원 B (Issue #5)
// 보드 화면 그리기, 카드·버튼 클릭 처리, 입력 창 열고 닫기를 맡는다.
// 데이터는 taskService.js 함수로만 바꾸고, 바뀌면 render()로 다시 그린다.

const view = { mode: 'priority', editingId: null };

const PRIORITY_LABEL = { urgent: '긴급', important: '중요', none: '우선순위 없음', later: '나중' };
const CATEGORY_LABEL = { study: '공부', personal: '개인', family: '가족', other: '기타' };

// 요소 하나 만들기 (태그, 클래스, 글자)
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

// 2026-01-28 → 2026/01/28
function fmtDate(value) {
  return value.split('-').join('/');
}

// 카드 하나 만들기
function makeCard(task) {
  const card = el('article', 'card' + (task.completed ? ' done' : ''));
  card.dataset.id = task.id;
  card.appendChild(el('h3', 'card-title', task.title));
  card.appendChild(el('span', 'tag tag-' + task.category, CATEGORY_LABEL[task.category]));
  if (task.memo) card.appendChild(el('p', 'card-memo', task.memo));

  // 날짜: 시작일이 있으면 「시작 → 마감」
  if (task.dueDate) {
    const text = (task.startDate ? fmtDate(task.startDate) + ' → ' : '') + fmtDate(task.dueDate);
    card.appendChild(el('p', 'card-date', text));
  }

  // 세부 할 일: 누르면 끝냄/취소 (끝낸 것은 취소선)
  if (task.subtasks.length > 0) {
    const ul = el('ul', 'subtasks');
    task.subtasks.forEach(function (sub) {
      const li = el('li', 'sub-item' + (sub.done ? ' done' : ''), sub.text);
      li.dataset.sub = sub.id;
      ul.appendChild(li);
    });
    card.appendChild(ul);
  }

  // 완료 체크
  const label = el('label', 'card-check');
  const box = el('input', 'task-check');
  box.type = 'checkbox';
  box.checked = task.completed;
  label.appendChild(box);
  label.appendChild(document.createTextNode(' 완료'));
  card.appendChild(label);
  return card;
}

// 칸(열) 하나 만들기: 이름 + 개수 + 카드들 + 새 페이지 버튼
function makeColumn(col) {
  const box = el('div', 'column col-' + col.key);
  const head = el('div', 'col-head');
  head.appendChild(el('span', 'col-label', col.label));
  head.appendChild(el('span', 'col-count', String(col.tasks.length)));
  box.appendChild(head);
  col.tasks.forEach(function (task) { box.appendChild(makeCard(task)); });
  if (col.key !== 'done') {
    const add = el('button', 'btn-new', '+ 새 페이지');
    add.type = 'button';
    add.dataset.key = col.key;
    box.appendChild(add);
  }
  return box;
}

// 화면 전체 다시 그리기
function render() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  const columns = [{ key: 'all', label: '전체 할 일', tasks: getTasks() }]; // 보기 탭은 Issue #6에서 추가
  columns.forEach(function (col) { board.appendChild(makeColumn(col)); });
}

// 입력 창 열기: task가 있으면 수정, 없으면 새로 만들기 (preset = 칸에 맞는 기본값)
function openForm(task, preset) {
  const empty = { title: '', priority: 'none', category: 'personal', memo: '', startDate: '', dueDate: '', subtasks: [] };
  const data = task || Object.assign(empty, preset);
  view.editingId = task ? task.id : null;
  document.getElementById('form-title').textContent = task ? '할 일 수정' : '새 할 일';
  document.getElementById('title-input').value = data.title;
  document.getElementById('priority-input').value = data.priority;
  document.getElementById('category-input').value = data.category;
  document.getElementById('memo-input').value = data.memo;
  document.getElementById('start-input').value = data.startDate;
  document.getElementById('due-input').value = data.dueDate;
  document.getElementById('subtasks-input').value = data.subtasks.map(function (s) { return s.text; }).join('\n');
  document.getElementById('submit-btn').textContent = task ? '수정 저장' : '추가';
  document.getElementById('delete-btn').hidden = !task;
  document.getElementById('form-error').textContent = '';
  document.getElementById('modal').hidden = false;
  document.getElementById('title-input').focus();
}

function closeForm() {
  document.getElementById('modal').hidden = true;
  view.editingId = null;
}

// 입력 창의 값을 객체 하나로 모으기
function readForm() {
  return {
    title: document.getElementById('title-input').value,
    priority: document.getElementById('priority-input').value,
    category: document.getElementById('category-input').value,
    memo: document.getElementById('memo-input').value,
    startDate: document.getElementById('start-input').value,
    dueDate: document.getElementById('due-input').value,
    subtasks: document.getElementById('subtasks-input').value.split('\n')
  };
}

function bindEvents() {
  // 입력 창: 추가 또는 수정 저장
  document.getElementById('task-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const input = readForm();
    const result = view.editingId ? updateTask(view.editingId, input) : addTask(input);
    if (!result.ok) {
      document.getElementById('form-error').textContent = result.message;
      return;
    }
    closeForm();
    render();
  });
  document.getElementById('cancel-btn').addEventListener('click', closeForm);
  document.getElementById('delete-btn').addEventListener('click', function () {
    if (!confirm('이 할 일을 삭제할까요?')) return;
    deleteTask(view.editingId);
    closeForm();
    render();
  });

  // 보드: 버튼이 많아서 보드 전체에 이벤트 하나만 단다 (이벤트 위임)
  document.getElementById('board').addEventListener('click', function (event) {
    const target = event.target;
    if (target.classList.contains('btn-new')) {
      const key = target.dataset.key;
      const preset = {};
      if (PRIORITY_LABEL[key]) preset.priority = key;
      if (CATEGORY_LABEL[key]) preset.category = key;
      openForm(null, preset);
      return;
    }
    const card = target.closest('.card');
    if (!card) return;
    const id = card.dataset.id;
    if (target.classList.contains('task-check')) {
      toggleTask(id);
      render();
    } else if (target.classList.contains('sub-item')) {
      toggleSubtask(id, target.dataset.sub);
      render();
    } else if (target.classList.contains('card-title')) {
      openForm(findTask(id));
    }
  });
}
