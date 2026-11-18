// storage.js — 담당: 팀원 A (Issue #2)
// 할 일 목록을 브라우저 LocalStorage에 저장하고 다시 불러온다.

const STORAGE_KEY = 'taskmate.tasks';

// 저장된 목록을 불러온다. 저장된 값이 없거나 깨져 있으면 빈 배열을 돌려준다.
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('저장된 데이터를 읽지 못해 빈 목록으로 시작합니다.', error);
    return [];
  }
}

// 목록 전체를 저장한다.
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  
}
