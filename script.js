// ========================================
// 基本設定・変数
// ========================================

const startButton = document.getElementById("startButton");

let members = [];
let currentIndex = 0;
let shuffledMembers = [];
let results = {
  love: [],
  like: [],
  normal: [],
  dislike: []
};
let judgmentHistory = [];


// ========================================
// CSVからメンバー情報を読み込む
// ========================================

async function loadMembers() {
  const response = await fetch("members.csv");
  const text = await response.text();

  const lines = text.trim().split(/\r?\n/);

  members = lines.slice(1).map(line => {
    const firstComma = line.indexOf(",");
    const secondComma = line.indexOf(",", firstComma + 1);

    return {
      id: line.slice(0, firstComma),
      name: line.slice(firstComma + 1, secondComma),
      group: line.slice(secondComma + 1)
    };
  });

  shuffledMembers = [...members].sort(() => Math.random() - 0.5);

  console.log("読み込んだ人数:", members.length);
  console.log(members);
}

loadMembers();


// ========================================
// スタートボタン
// ========================================

startButton.addEventListener("click", () => {
  if (members.length === 0) {
    return;
  }

  currentIndex = 0;
  const member = shuffledMembers[currentIndex];

  document.getElementById("sortScreen").hidden = false;
  startButton.hidden = true;

  document.getElementById("progress").textContent =
    `1 / ${members.length}`;

  showMember(member);
});


// ========================================
// メンバーをカードに表示
// ========================================

function showMember(member) {
  document.getElementById("memberImage").src =
    `images/${member.id}.jpg`;

  document.getElementById("memberImage").alt =
    member.name;

  document.getElementById("memberName").textContent =
    member.name;

  document.getElementById("memberGroup").textContent =
    member.group;

  document.getElementById("progress").textContent =
    `${currentIndex + 1} / ${shuffledMembers.length}`;
}


// ========================================
// カードのスワイプ処理
// ========================================

const card = document.getElementById("memberCard");

let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;


// ----------------------------------------
// カードを掴んだとき
// ----------------------------------------

card.addEventListener("pointerdown", (event) => {
  console.log("カードを掴んだ");

  isDragging = true;

  startX = event.clientX;
  startY = event.clientY;

  card.setPointerCapture(event.pointerId);
});


// ----------------------------------------
// カードを動かしているとき
// ----------------------------------------

card.addEventListener("pointermove", (event) => {
  if (!isDragging) {
    return;
  }

  currentX = event.clientX - startX;
  currentY = event.clientY - startY;

  card.style.transform =
    `translate(${currentX}px, ${currentY}px)`;
});


// ========================================
// スワイプ方向を判定
// ========================================

function getSwipeDirection(x, y) {
  const distance = Math.sqrt(x * x + y * y);

  if (distance < 100) {
    return null;
  }

  if (Math.abs(x) > Math.abs(y)) {
    return x > 0 ? "like" : "dislike";
  }

  return y < 0 ? "love" : "normal";
}


// ========================================
// カードを離したとき
// ========================================

card.addEventListener("pointerup", () => {
  if (!isDragging) {
    return;
  }

  isDragging = false;

  const direction = getSwipeDirection(currentX, currentY);

  if (direction) {
  results[direction].push(shuffledMembers[currentIndex]);

judgmentHistory.push({
  member: shuffledMembers[currentIndex],
  direction: direction
});



  console.log("今回の判定:", direction);
console.log("判定結果:", results);



  currentIndex++;

  if (currentIndex < shuffledMembers.length) {
  showMember(shuffledMembers[currentIndex]);
} else {
  showRound2Intro();
}
}

  card.style.transform = "translate(0, 0)";

  currentX = 0;
  currentY = 0;
});


// ========================================
// 戻るボタン
// ========================================

const backButton = document.getElementById("backButton");

console.log("戻るボタン:", backButton);

backButton.addEventListener("click", () => {
  if (judgmentHistory.length === 0) {
    return;
  }

  const lastJudgment = judgmentHistory.pop();

  results[lastJudgment.direction] =
    results[lastJudgment.direction].filter(
      member => member.id !== lastJudgment.member.id
    );

  currentIndex--;

  showMember(shuffledMembers[currentIndex]);
});


// ========================================
// 第2ラウンドの説明画面
// ========================================

const round2Intro = document.getElementById("round2Intro");
const round2IntroText = document.getElementById("round2IntroText");
const round2StartButton =
  document.getElementById("round2StartButton");

function showRound2Intro() {
  document.getElementById("sortScreen").hidden = true;
  round2Intro.hidden = false;

  if (results.love.length >= 20) {
    round2IntroText.textContent =
      "「大好き」に選んだメンバーの中から、第2ラウンドへ進めるのは20人までです。残念ながら予選敗退にするメンバーを「n人」選択して「次へ」を押してください。";
  } else {
    round2IntroText.textContent =
      "「大好き」のメンバーは全員予選を通過します。残りの枠は「好き」のメンバーから選びます。6人ずつ表示されるので、その中から「1~4人まで」を「好きな順番に」選んで「次へ」を押してください。";
  }
}


// ========================================
// 第2ラウンド開始ボタン
// ========================================

round2StartButton.addEventListener("click", () => {
  round2Intro.hidden = true;
  document.getElementById("round2Screen").hidden = false;

  document.getElementById("round2Progress").textContent =
    "第2ラウンド準備中...";
});