// main.js — 담당: 공동 (Issue #1)
// 페이지가 열리면 이벤트를 연결하고 저장된 목록을 처음 한 번 그린다.

document.addEventListener('DOMContentLoaded', function () {
  bindEvents();
  render();
});
