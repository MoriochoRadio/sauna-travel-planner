const pageUrl = "https://moriochoradio.github.io/sauna-travel-planner/";
const targets = await fetch("http://127.0.0.1:9222/json").then((response) => response.json());
const target = targets.find((item) => item.type === "page" && item.url === pageUrl);
if (!target?.webSocketDebuggerUrl) throw new Error("Public GitHub Pages target was not available");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const resolver = pending.get(message.id);
  if (!resolver) return;
  pending.delete(message.id);
  message.error ? resolver.reject(new Error(message.error.message)) : resolver.resolve(message.result);
});

function command(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? "Browser evaluation failed");
  return result.result.value;
}

await command("Page.enable");
await command("Page.reload", { ignoreCache: true });
await new Promise((resolve) => setTimeout(resolve, 1800));
await command("Runtime.enable");
await evaluate("new Promise((resolve, reject) => { const limit = Date.now() + 10000; const wait = () => document.querySelectorAll('.place').length === 6 ? resolve() : Date.now() > limit ? reject(new Error('Static cards did not render')) : setTimeout(wait, 25); wait(); })");
await evaluate("localStorage.setItem('ongihaeng-static-plan', '[]')");
await command("Page.reload", { ignoreCache: true });
await new Promise((resolve) => setTimeout(resolve, 1800));
await evaluate("new Promise((resolve, reject) => { const limit = Date.now() + 10000; const wait = () => document.querySelectorAll('.place').length === 6 ? resolve() : Date.now() > limit ? reject(new Error('Static cards did not render after reset')) : setTimeout(wait, 25); wait(); })");

const result = {};
result.initialPlaceCount = await evaluate("document.querySelectorAll('.place').length");
result.heroImage = await evaluate("getComputedStyle(document.querySelector('.hero')).backgroundImage.includes('ongihaeng-hero.webp')");
result.officialLinkCount = await evaluate("[...document.querySelectorAll('a[target=_blank]')].filter(link => link.href.startsWith('https://')).length");
result.verificationBadges = await evaluate("document.querySelectorAll('.place .verification').length === 6 && [...document.querySelectorAll('.place .verification')].some(badge => badge.textContent.includes('공식 정보 확인 · 2026.08.13')) && [...document.querySelectorAll('.place .verification')].some(badge => badge.textContent.includes('공식 정보 보강 중 · 2026.08.13'))");
result.sourceContext = await evaluate("document.querySelectorAll('.place .source-note').length === 6 && document.querySelector('#placesGrid').textContent.includes('신세계백화점 스파랜드 공식 안내') && document.querySelector('#placesGrid').textContent.includes('운영 시간·요금·기본 이용 시간을 공식 안내에서 확인하세요')");
result.reviewSchedule = await evaluate("[...document.querySelectorAll('.place .source-note')].filter(note => note.textContent.includes('다음 검토')).length === 6 && document.querySelector('#placesGrid').textContent.includes('2026.11.13 이전') && document.querySelector('#placesGrid').textContent.includes('2026.09.13 이전')");
await evaluate("[...document.querySelectorAll('button.filter')].find(button => button.textContent.trim() === '부산').click()");
result.busanPlaceCount = await evaluate("document.querySelectorAll('.place').length");
await evaluate("document.querySelector('.place .add').click()");
result.addedPlan = await evaluate("JSON.parse(localStorage.getItem('ongihaeng-static-plan')).some(item => item.id === 'spaland') && document.querySelector('#planList').textContent.includes('스파랜드 센텀시티')");
await evaluate("document.querySelector('.remove').click()");
result.removedPlan = await evaluate("JSON.parse(localStorage.getItem('ongihaeng-static-plan')).length === 0 && document.querySelector('#planList').textContent.includes('아직 담은 장소가 없어요')");
await evaluate("localStorage.setItem('ongihaeng-static-plan', '{broken')");
await command("Page.reload", { ignoreCache: true });
await new Promise((resolve) => setTimeout(resolve, 1800));
result.corruptStorageRecovery = await evaluate("document.querySelector('#planList').textContent.includes('아직 담은 장소가 없어요') && localStorage.getItem('ongihaeng-static-plan') === '[]'");
await evaluate("addPlan('spaland')");
result.backupCode = await evaluate("exportPlan() === '{\"version\":2,\"items\":[{\"id\":\"spaland\",\"note\":\"\"}]}'");
await evaluate("document.querySelector('#planImportText').value = '{\"version\":2,\"items\":[{\"id\":\"deokgu\",\"note\":\"숙박 후 입욕\"},{\"id\":\"spaland\",\"note\":\"오후 이용\"},{\"id\":\"missing-place\",\"note\":\"제외\"}]}' ; importPlan(); movePlanItem(1, -1); updatePlanNote('spaland', '저녁 식사 전 이용')");
result.backupRestore = await evaluate("JSON.stringify(JSON.parse(localStorage.getItem('ongihaeng-static-plan'))) === '[{\"id\":\"spaland\",\"note\":\"저녁 식사 전 이용\"},{\"id\":\"deokgu\",\"note\":\"숙박 후 입욕\"}]' && document.querySelector('#planList').textContent.includes('덕구온천 리조트') && document.querySelector('#planBackupStatus').textContent.includes('일정을 불러왔어요')");

socket.close();
console.log(JSON.stringify(result, null, 2));
