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

const result = {};
result.initialPlaceCount = await evaluate("document.querySelectorAll('.place').length");
result.heroImage = await evaluate("getComputedStyle(document.querySelector('.hero')).backgroundImage.includes('ongihaeng-hero.webp')");
result.officialLinkCount = await evaluate("[...document.querySelectorAll('a[target=_blank]')].filter(link => link.href.startsWith('https://')).length");
await evaluate("[...document.querySelectorAll('button.filter')].find(button => button.textContent.trim() === '부산').click()");
result.busanPlaceCount = await evaluate("document.querySelectorAll('.place').length");
await evaluate("document.querySelector('.place .add').click()");
result.addedPlan = await evaluate("JSON.parse(localStorage.getItem('ongihaeng-static-plan')).includes('spaland') && document.querySelector('#planList').textContent.includes('스파랜드 센텀시티')");
await evaluate("document.querySelector('.remove').click()");
result.removedPlan = await evaluate("JSON.parse(localStorage.getItem('ongihaeng-static-plan')).length === 0 && document.querySelector('#planList').textContent.includes('아직 담은 장소가 없어요')");
await evaluate("localStorage.setItem('ongihaeng-static-plan', '{broken')");
await command("Page.reload", { ignoreCache: true });
await new Promise((resolve) => setTimeout(resolve, 1800));
result.corruptStorageRecovery = await evaluate("document.querySelector('#planList').textContent.includes('아직 담은 장소가 없어요') && localStorage.getItem('ongihaeng-static-plan') === '[]'");

socket.close();
console.log(JSON.stringify(result, null, 2));
