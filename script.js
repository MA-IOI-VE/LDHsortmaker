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
      group: line.slice(secondComma + 1).replace(/^"|"$/g, "")
    };
  });

  shuffledMembers = [...members].sort(() => Math.random() - 0.5);
  
  // 画像を先読み
  shuffledMembers.forEach(member => {
    const img = new Image();
    img.src = `images/${member.id}.jpg`;
  });

console.log("読み込んだ人数:", members.length);
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

  document.getElementById("startScreen").hidden = true;

  const member = shuffledMembers[currentIndex];

  document.getElementById("sortScreen").hidden = false;

  document.getElementById("progress").textContent =
    `1 / ${members.length}`;

  showMember(member);
});


// ========================================
// ========================================
// 第2ラウンド テスト
// ========================================
// ========================================

const testRound2Button =
  document.getElementById("testRound2Button");

testRound2Button.addEventListener("click", () => {
results.love = [...members.slice(0, 10)];
results.like = [...members.slice(10, 13)];
results.normal = [...members.slice(13, 75)];

console.log("テストNORMAL人数", results.normal.length);

console.log("テスト：showRound2Intro実行");

  showRound2Intro();
});

// ========================================
// ========================================
// ========================================
// ========================================



// ========================================
// ========================================
// 第１ラウンド
// ========================================
// ========================================

// ========================================
// メンバーをカードに表示
// ========================================

function setCard(cardPrefix, member) {

  document.getElementById(`${cardPrefix}Image`).src =
    `images/${member.id}.jpg`;

  document.getElementById(`${cardPrefix}Image`).alt =
    member.name;

  document.getElementById(`${cardPrefix}Name`).textContent =
    member.name;

  document.getElementById(`${cardPrefix}Group`).textContent =
    member.group;

}

function showMember(member) {

  setCard("member", member);

  const followingMember =
    shuffledMembers[currentIndex + 1];

  if (followingMember) {

    setCard("nextMember", followingMember);

    document.getElementById("nextCard").style.visibility =
      "visible";

  } else {

    document.getElementById("nextCard").style.visibility =
      "hidden";
  }

  document.getElementById("progress").textContent =
    `${currentIndex + 1} / ${shuffledMembers.length}`;

  document.getElementById("backButton").disabled =
    judgmentHistory.length === 0;
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
let animationFrame = null;

// ----------------------------------------
// カードを掴んだとき
// ----------------------------------------

card.addEventListener("pointerup", () => {
  if (!isDragging) {
    return;
  }

  isDragging = false;

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  const direction =
    getSwipeDirection(currentX, currentY);

  // 判定なし → 元の位置へ戻す
  if (!direction) {
    card.style.transform = "translate(0, 0)";

    card.classList.remove(
      "card-love",
      "card-like",
      "card-normal"
    );

    currentX = 0;
    currentY = 0;

    return;
  }

  // 判定を記録
  results[direction].push(
    shuffledMembers[currentIndex]
  );

  judgmentHistory.push({
    member: shuffledMembers[currentIndex],
    direction: direction
  });

  // スワイプ方向へ飛ばす
  const flyX =
  direction === "like"
    ? Math.max(window.innerWidth * 1.2, 500)
    : direction === "normal" && currentX < 0
      ? -window.innerWidth * 1.2
      : 0;

  const flyY =
    direction === "love"
      ? -window.innerHeight * 1.2
      : 0;

  const rotation =
  direction === "like"
    ? 15
    : direction === "normal" && currentX < 0
      ? -15
      : 0;

  card.style.transition =
    "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)";

  card.style.transform =
    `translate(${flyX}px, ${flyY}px) rotate(${rotation}deg)`;

  setTimeout(() => {

    currentIndex++;

    if (currentIndex < shuffledMembers.length) {

      card.classList.remove(
        "card-love",
        "card-like",
        "card-normal"
      );

      card.style.transition = "none";
      card.style.transform = "translate(0, 0)";

      showMember(shuffledMembers[currentIndex]);

      card.style.zIndex = "2";

      document.getElementById("nextCard").style.zIndex = "1";

    } else {
      
      showRound2Intro();

    }

    currentX = 0;
    currentY = 0;

    requestAnimationFrame(() => {
      card.style.transition =
        "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease";
    });

  }, 350);

});

card.addEventListener("pointerdown", (event) => {
  isDragging = true;

  startX = event.clientX;
  startY = event.clientY;

  currentX = 0;
  currentY = 0;

  card.style.transition = "none";

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

  if (animationFrame) {
    return;
  }

  animationFrame = requestAnimationFrame(() => {
    const rotation = currentX * 0.05;

card.style.transform =
  `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;

    card.classList.remove(
      "card-love",
      "card-like",
      "card-normal"
    );

    const direction =
      getSwipeDirection(currentX, currentY);

    if (direction) {
      card.classList.add(`card-${direction}`);
    }

    animationFrame = null;
  });
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
    return x > 0 ? "like" : "normal";
  }

  if (y < 0) {
    return "love";
  }

  return null;
}

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
// ========================================
// 第2ラウンドの説明画面
// ========================================
// ========================================

const round2Intro =
  document.getElementById("round2Intro");

const round2StartButton =
  document.getElementById("round2StartButton");

function showRound2Intro() {

  round2StartButton.textContent = "START";
  document.getElementById("sortScreen").hidden = true;
  round2Intro.hidden = false;

  // 一旦全部非表示
  document.getElementById("round2OverText").hidden = true;
  document.getElementById("round2FullText").hidden = true;
  document.getElementById("round2UnderText").hidden = true;

  // LOVEが16人より多い
  if (results.love.length > 16) {

    const overCount =
      results.love.length - 16;

    document.getElementById("round2OverCount").textContent =
      `${overCount}人`;

    document.getElementById("round2OverText").hidden = false;

  // LOVEが16人
  } else if (
    results.love.length === 16 ||
    results.love.length + results.like.length === 16
  ) {

    document.getElementById("round2FullText").hidden = false;
    round2StartButton.textContent = "NEXT";
  
  // LOVEが16人未満
  } else {
    document.getElementById("round2UnderText").hidden = false;
  }
}

// ========================================
// 第2ラウンド開始ボタン
// ========================================

round2StartButton.addEventListener("click", () => {
  round2Intro.hidden = true;
  document.getElementById("round2Screen").hidden = false;

  startRound2();
});



// ========================================
// ========================================
// 第2ラウンド
// ========================================
// ========================================

let round2Eliminated = [];

// ----------------------------------------
// 第2ラウンド開始
// ----------------------------------------

function startRound2() {

  round2Eliminated = [];

  if (results.love.length >= 17) {

    startLoveSelection();

  } else if (
    results.love.length === 16 ||
    results.love.length + results.like.length === 16
  ) {

    // LOVEだけ、またはLOVE+LIKEで16人確定
    if (results.love.length < 16) {
      results.love.push(...results.like);
    }

    finishRound2();

  } else {

    startLikeSelection();

  }

}

// ========================================
// パターン1.残り枠
// ========================================

let round2LikeMembers = [];
let round2LikeIndex = 0;
let round2NormalMembers = [];
let round2NormalIndex = 0;
let round2NormalSelected = [];
let round2NormalUnselected = [];
let round2NormalPassSelected = [];
let round2NormalConfirmed = [];
let round2SelectionType = "like";

// 現在の「6人」の中で選択したメンバー
let round2LikeSelected = [];
// 今回の一巡で選択されたメンバー
let round2PassSelected = [];
// 今回の一巡で選択されなかったメンバー
let round2PassUnselected = [];
// 最終的に予選を通過したLIKEメンバーの順番
let round2LikeOrder = [];
let finalGroups = [];

function startLikeSelection() {

  const remainingSlots =
    16 - results.love.length;

  // LIKE全員を通過させても16人に届かない場合
  // LIKEは選抜せず、全員通過
  if (results.like.length <= remainingSlots) {

    results.love.push(...results.like);
    round2LikeOrder.push(...results.like);

    // まだ枠が残っている → NORMALへ
    if (results.love.length < 16) {

      round2NormalMembers = [...results.normal];

      round2NormalIndex = 0;
      round2NormalSelected = [];
      round2NormalUnselected = [];
      round2NormalConfirmed = [];
      round2NormalPassSelected = [];

      round2SelectionType = "normal";

      showRound2SelectionGroup();
      return;
    }

    // 16人ちょうど
    finishRound2();
    return;
  }

  // LIKEの人数が残り枠を超える場合だけ選抜
  round2LikeMembers = [...results.like];
  round2LikeIndex = 0;

  round2LikeSelected = [];
  round2PassSelected = [];
  round2PassUnselected = [];

  showLikeGroup();
}

// ----------------------------------------
// 6人のグループを表示
// ----------------------------------------

function showRound2SelectionGroup() {

  console.log(
  "SelectionType",
  round2SelectionType
);

  const isNormal =
    round2SelectionType === "normal";

    console.log(
  "showRound2SelectionGroup",
  round2SelectionType
);

  const members =
    isNormal
      ? round2NormalMembers
      : round2LikeMembers;

  const index =
    isNormal
      ? round2NormalIndex
      : round2LikeIndex;

  const group =
    members.slice(index, index + 6);
    console.log(
  "表示グループ",
  "候補人数=", members.length,
  "開始位置=", index,
  "グループ人数=", group.length
);

  const area =
    document.getElementById("round2Area");

  area.innerHTML = "";

  group.forEach(member => {

    const card =
      document.createElement("div");

    card.className = "round2Card";

    card.innerHTML = `
    <img src="images/${member.id}.jpg" alt="${member.name}">
    <h3>${member.name}</h3>
    <p>${member.group}</p>
  `;

card.addEventListener("click", () => {

  console.log("カードクリック", member.name);

  const selected =
    isNormal
      ? round2NormalSelected
      : round2LikeSelected;

  const remainingSlots =
    16 - results.love.length;

  console.log(
    "選択前",
    selected.length,
    "残り枠",
    remainingSlots
  );

  const selectedIndex =
   selected.findIndex(
     item => item.id === member.id
  );

  // すでに選択済み → 選択解除
  if (selectedIndex !== -1) {

    selected.splice(selectedIndex, 1);

    card.classList.remove("eliminated");

    console.log("選択解除", member.name);

    updateRound2SelectionButton();
    return;
  }

  // 4人上限
  if (selected.length >= 4) {
    console.log("4人上限");
    return;
  }

  // 選択
  selected.push(member);

  console.log("選択後", selected.length);

  card.classList.add("eliminated");

updateRound2SelectionButton();
});
    area.appendChild(card);
  });

  updateRound2SelectionButton();
}

function updateRound2SelectionButton() {

  const button =
    document.getElementById("round2ConfirmButton");

  const selected =
    round2SelectionType === "normal"
      ? round2NormalSelected
      : round2LikeSelected;

  const remaining =
    16 - results.love.length;

  button.disabled = false;
  button.textContent = "NEXT";
}

function showLikeGroup() {

  round2SelectionType = "like";

  showRound2SelectionGroup();
}

// ----------------------------------------
// 「次へ」ボタンの状態
// ----------------------------------------

function updateLikeButton() {
  const button =
    document.getElementById("round2ConfirmButton");

  const currentGroupSize = Math.min(
    6,
    round2LikeMembers.length - round2LikeIndex
  );

  const maxSelectable = Math.min(
    4,
    currentGroupSize
  );

  button.disabled = false;

  button.textContent =
    `NEXT`;
}

// ----------------------------------------
// 選択・選択解除
// ----------------------------------------

function toggleLikeSelection(member, card) {
  const index = round2LikeSelected.findIndex(
    person => person.id === member.id
  );

  if (index !== -1) {
    round2LikeSelected.splice(index, 1);
    card.classList.remove("eliminated");

    updateLikeButton();

    return;
  }

  if (round2LikeSelected.length >= 4) {
    return;
  }

  round2LikeSelected.push(member);
  card.classList.add("eliminated");

  updateLikeButton();
}

// ----------------------------------------
// 選択人数の表示
// ----------------------------------------

function updateLikeProgress() {
  const remainingSlots = 16 - results.love.length;

  document.getElementById("round2Progress").textContent =
    `${round2LikeSelected.length}/${remainingSlots}`;
}

// ========================================
// パターン2.予選敗退を選ぶ
// ========================================

function startLoveSelection() {
  const loveMembers = [...results.love];

  const eliminateCount = loveMembers.length - 16;

  document.getElementById("round2Progress").textContent =
    `${eliminateCount}人を選択してください`;

  const area = document.getElementById("round2Area");

  area.innerHTML = "";

  loveMembers.forEach(member => {
    const card = document.createElement("div");

    card.className = "round2Card";

    card.innerHTML = `
      <img src="images/${member.id}.jpg" alt="${member.name}">
      <h3>${member.name}</h3>
      <p>${member.group}</p>
    `;

    card.addEventListener("click", () => {
      toggleRound2Elimination(member, card);
    });

    area.appendChild(card);
  });

  updateRound2Button(eliminateCount);
}

// ----------------------------------------
// 予選敗退の選択・解除
// ----------------------------------------

function toggleRound2Elimination(member, card) {
  const index = round2Eliminated.findIndex(
    person => person.id === member.id
  );

  if (index !== -1) {
    round2Eliminated.splice(index, 1);
    card.classList.remove("eliminated");
  } else {
    const eliminateCount = results.love.length - 16;

    if (round2Eliminated.length >= eliminateCount) {
      return;
    }

    round2Eliminated.push(member);
    card.classList.add("eliminated");
  }

  updateRound2Button(results.love.length - 16);
}

// ----------------------------------------
// 「次へ」ボタンの状態
// ----------------------------------------

function updateRound2Button(requiredCount) {
  const button =
    document.getElementById("round2ConfirmButton");

  if (requiredCount === 0) {
    button.disabled = false;
    button.textContent = "NEXT";
    return;
  }

  button.disabled =
    round2Eliminated.length !== requiredCount;

  button.textContent =
    `NEXT（${round2Eliminated.length} / ${requiredCount}）`;
}


// ========================================
// 第2ラウンド「次へ」
// ========================================

const round2ConfirmButton =
  document.getElementById("round2ConfirmButton");

round2ConfirmButton.addEventListener("click", () => {

  if (round2SelectionType === "normal") {

  round2NormalPassSelected.push(
    ...round2NormalSelected
  );

  const currentGroup =
    round2NormalMembers.slice(
      round2NormalIndex,
      round2NormalIndex + 6
    );

  currentGroup.forEach(member => {

    const isSelected =
      round2NormalSelected.some(
        selected => selected.id === member.id
      );

    if (!isSelected) {
      round2NormalUnselected.push(member);
    }

  });

  round2NormalIndex += 6;

  round2NormalSelected = [];

  // まだ一巡していない
  if (
    round2NormalIndex <
    round2NormalMembers.length
  ) {
    showRound2SelectionGroup();
    return;
  }

  // 一巡終了
 const totalSelected =
  round2NormalPassSelected.length;

    const remainingRequired =
  16 - results.love.length
  - round2NormalConfirmed.length;

    console.log(
  "NORMAL一巡終了",
  "候補人数=", round2NormalMembers.length,
  "選択人数=", totalSelected,
  "必要人数=", remainingRequired,
  "未選択人数=", round2NormalUnselected.length
);

  // ちょうど必要人数
  if (totalSelected === remainingRequired) {

  // 今回選んだ人も確定通過
    round2NormalConfirmed.push(
      ...round2NormalPassSelected
    );

  // 確定した全員をROUND2通過者に追加
    results.love.push(
      ...round2NormalConfirmed
    );

    round2LikeOrder.push(
      ...round2NormalConfirmed
    );

    finishRound2();
    return;
  }

    // 選びすぎ → 選んだ人だけで再選抜
  if (totalSelected > remainingRequired) {

    round2NormalMembers =
      [...round2NormalPassSelected];

    round2NormalIndex = 0;
    round2NormalSelected = [];
    round2NormalUnselected = [];
    round2NormalPassSelected = [];

    showRound2SelectionGroup();
    return;
  }

    // 足りない → 今回選んだ人は確定通過
    if (totalSelected < remainingRequired) {

      round2NormalConfirmed.push(
        ...round2NormalPassSelected
      );

      round2NormalMembers =
        [...round2NormalUnselected];

      round2NormalIndex = 0;
      round2NormalSelected = [];
      round2NormalUnselected = [];
      round2NormalPassSelected = [];

    // 次の一巡の候補人数と残り枠を確認
    const nextRemainingRequired =
      16
      - results.love.length
      - round2NormalConfirmed.length;

    // 候補と残り枠が一致 → 全員確定して終了
    if (
      round2NormalMembers.length ===
      nextRemainingRequired
    ) {

      round2NormalConfirmed.push(
        ...round2NormalMembers
      );

      results.love.push(
        ...round2NormalConfirmed
      );

      round2LikeOrder.push(
        ...round2NormalConfirmed
      );

      finishRound2();
      return;
    }

    // まだ選抜が必要
    showRound2SelectionGroup();
    return;
  }
}

  // LOVEが17人以上の場合は、LOVE敗退ルート
  if (results.love.length >= 17) {
    results.love = results.love.filter(
      member =>
        !round2Eliminated.some(
          eliminated => eliminated.id === member.id
        )
    );

    finishRound2();
    return;
  }

  round2PassSelected.push(...round2LikeSelected);

  const currentGroup =
    round2LikeMembers.slice(
      round2LikeIndex,
      round2LikeIndex + 6
    );

  currentGroup.forEach(member => {
    const isSelected =
      round2LikeSelected.some(
        selected => selected.id === member.id
      );

    if (!isSelected) {
      round2PassUnselected.push(member);
    }
  });

  // まだ次の候補がある
  round2LikeIndex += 6;

  if (round2LikeIndex < round2LikeMembers.length) {
    showLikeGroup();
    return;
  }

  // 一巡終了
  const totalSelected =
    results.love.length + round2PassSelected.length;

  // 16人ちょうど
  if (totalSelected === 16) {
    results.love.push(...round2PassSelected);
    round2LikeOrder.push(...round2PassSelected);

    finishRound2();
    return;
  }

  // 17人以上 → 今回選ばれた人だけを再選抜
  if (totalSelected > 16) {
    round2LikeMembers = [...round2PassSelected];
  }

  // LOVE + LIKE が16人未満
if (totalSelected < 16) {

  // LOVEとLIKEを全員通過させる
  results.love.push(...round2PassSelected);
  round2LikeOrder.push(...round2PassSelected);

  // NORMALを選抜対象にする
  console.log(
  "NORMAL開始",
  results.normal.length
);
  round2NormalMembers = [...results.normal];

  round2NormalIndex = 0;
  round2NormalSelected = [];
  round2NormalUnselected = [];

  round2SelectionType = "normal";

    showRound2SelectionGroup();

    console.log(
  "切替後",
  round2SelectionType
);

    return;
  }

  // 次の一巡を開始
  round2LikeIndex = 0;
  round2LikeSelected = [];
  round2PassSelected = [];
  round2PassUnselected = [];

  showLikeGroup();
});

  // ----------------------------------------
  // LOVEがちょうど16人の場合
  // ----------------------------------------

function finishRound2() {
  console.log("予選通過者:", results.love);
  console.log("通過人数:", results.love.length);

  finalGroups = createFinalGroups();

  console.log("最終4グループ:", finalGroups);

  document.getElementById("round2Screen").hidden = true;
  document.getElementById("finalIntro").hidden = false;
}

const finalStartButton =
  document.getElementById("finalStartButton");

finalStartButton.addEventListener("click", () => {
  document.getElementById("finalIntro").hidden = true;
  startFinalRanking();
});

// ========================================
// 16人を4グループに分ける
// ========================================

function createFinalGroups() {
  const loveMembers = [...results.love];

  // round2LikeOrderに入っている人のうち、
  // LOVEにも入っている人は除外する
  const loveIds = new Set(
    loveMembers.map(member => member.id)
  );

  const likeMembers =
    [...round2LikeOrder].filter(
      member => !loveIds.has(member.id)
    );

  loveMembers.sort(() => Math.random() - 0.5);

  const groups = [
    [],
    [],
    [],
    []
  ];

  likeMembers.forEach((member, index) => {
    groups[index % 4].push(member);
  });

  const remainingLove = [...loveMembers];

  groups.forEach(group => {
    while (group.length < 4 && remainingLove.length > 0) {
      group.push(remainingLove.shift());
    }
  });

  console.log("最終4グループ:", groups);

  return groups;
}

// ========================================
// ========================================
// 最終順位決定
// ========================================
// ========================================

let currentFinalGroup = 0;
let finalRanking = [];
let finalGroupRankings = [];
let currentGroupRanking = [];

// ----------------------------------------
// 最終順位決定を開始
// ----------------------------------------

function startFinalRanking() {
  finalScreenMode = "round2";
  currentFinalGroup = 0;
  finalRanking = [];
  finalGroupRankings = [];

  document.getElementById("round2Screen").hidden = true;
  document.getElementById("finalScreen").hidden = false;

  showFinalGroup();
}

// ----------------------------------------
// 4人のグループを表示
// ----------------------------------------

function showFinalGroup() {
  const group = finalGroups[currentFinalGroup];

  currentGroupRanking = [];

  document.getElementById("finalTitle").textContent =
  "ROUND2";

  document.getElementById("finalProgress").textContent =
    "1位から順番に選択してください";

  const area = document.getElementById("finalArea");

  area.innerHTML = "";

  group.forEach(member => {
    const card = document.createElement("div");

    card.className = "finalCard";

    card.innerHTML = `
      <img src="images/${member.id}.jpg" alt="${member.name}">
      <h3>${member.name}</h3>
      <p>${member.group}</p>
    `;

    card.addEventListener("click", () => {
      selectFinalMember(member, card);
    });

    area.appendChild(card);
  });
}

// ----------------------------------------
// 4人の順位を決める
// ----------------------------------------

function selectFinalMember(member, card) {

    console.log(
    "選択:",
    member.name,
    "現在の人数:",
    currentGroupRanking.length
  );

  // すでに選択済みなら何もしない
  if (
    currentGroupRanking.some(
      person => person.id === member.id
    )
  ) {
    return;
  }

  currentGroupRanking.push(member);
  card.classList.add("selected");

  // 3人選んだら、残り1人を4位にする
  if (currentGroupRanking.length === 3) {

  const group = finalGroups[currentFinalGroup];

  const lastMember = group.find(
    person =>
      !currentGroupRanking.some(
        selected => selected.id === person.id
      )
  );

    currentGroupRanking.push(lastMember);

    setTimeout(() => {
      finishFinalGroup();
    }, 150);

    return;
  }
}

// ----------------------------------------
// 最終グループの順位確定
// ----------------------------------------

function finishFinalGroup() {

console.log("finishFinalGroup実行");

  // グループごとの順位を保存
  finalGroupRankings.push([...currentGroupRanking]);

  // 第1段階の順位をメンバーごとに保存
  currentGroupRanking.forEach((member, index) => {
    member.stage1Rank = index + 1;
  });

  // 全体用にも保存
  finalRanking.push(...currentGroupRanking);

  console.log(
    `グループ${currentFinalGroup + 1}の順位:`,
    currentGroupRanking
  );

  currentFinalGroup++;

  // まだグループが残っている
  if (currentFinalGroup < finalGroups.length) {
    showFinalGroup();
    return;
  }

   // 4グループすべて終了
  console.log("グループ別順位:", finalGroupRankings);
  console.log("全グループの順位:", finalRanking);

  document.getElementById("finalScreen").hidden = true;

  document.getElementById("finalScreen").hidden = true;

  startTop6Merge();
}

const finalBattleStartButton =
  document.getElementById("finalBattleStartButton");

finalBattleStartButton.addEventListener("click", () => {

  document.getElementById("finalBattleIntro").hidden = true;
  startFinalRanking6();
});

const finalBackButton =
  document.getElementById("finalBackButton");

let finalScreenMode = "round2";

finalBackButton.addEventListener("click", () => {

  document.getElementById("finalScreen").hidden = true;

  if (finalScreenMode === "round2") {
    document.getElementById("finalIntro").hidden = false;
  } else {
    document.getElementById("finalBattleIntro").hidden = false;
  }
});

// ========================================
// TOP6決定
// ========================================

let top6Ranking = [];
let mergeRound = 0;
let mergeCandidates = [];
let mergeCurrentRanking = [];

// ----------------------------------------
// TOP6の決定を開始
// ----------------------------------------

function startTop6Merge() {

  top6Ranking = [];
  mergeRound = 0;
  mergeCandidates = [];
  mergeCurrentRanking = [];

  document.getElementById("finalScreen").hidden = false;

  showMergeComparison();
}

// ----------------------------------------
// 4人の候補を表示
// ----------------------------------------

function showMergeComparison() {

  const candidates =
    finalGroupRankings.map(
      group => group[mergeRound]
    );

  mergeCandidates = candidates.filter(
    member => member
  );

  mergeCurrentRanking = [];

  showMergeComparisonScreen();
}

// ----------------------------------------
// 4人の中から順位を決める
// ----------------------------------------

function selectMergeMember(member, card) {

  if (
    mergeCurrentRanking.some(
      selected => selected.id === member.id
    )
  ) {
    return;
  }

  mergeCurrentRanking.push(member);

  card.classList.add("selected");

  // 3人選んだら、最後の1人を4位にする
  if (mergeCurrentRanking.length === 3) {

    const lastMember =
      mergeCandidates.find(
        candidate =>
          !mergeCurrentRanking.some(
            selected =>
              selected.id === candidate.id
          )
      );

    mergeCurrentRanking.push(lastMember);

    setTimeout(() => {
      finishMergeRound();
    }, 150);

    return;
  }
}

// ----------------------------------------
// 4人の順位を確定
// ----------------------------------------

function finishMergeRound() {

  console.log(
    `第${mergeRound + 1}ブロックの順位:`,
    mergeCurrentRanking
  );

  // 今回の4人を全体順位に追加
  top6Ranking.push(
    ...mergeCurrentRanking
  );

  console.log(
    "現在の全体順位:",
    top6Ranking
  );

  // 6人決まったら終了
  if (top6Ranking.length >= 6) {

    top6Ranking =
      top6Ranking.slice(0, 6);

    document.getElementById("finalScreen").hidden = true;
    document.getElementById("finalBattleIntro").hidden = false;

    return;
  }

  // 次の順位の4人へ
  mergeRound++;

  showMergeComparison();
}

// ----------------------------------------
// 全体TOP6の比較画面
// ----------------------------------------

function showMergeComparisonScreen() {

  document.getElementById("finalTitle").textContent =
    "ROUND2";

  document.getElementById("finalProgress").textContent =
  "1位から順番に選択してください";

  const area =
    document.getElementById("finalArea");

  area.innerHTML = "";

  mergeCandidates.forEach(member => {

    const card =
      document.createElement("div");

    card.className = "finalCard";

    card.innerHTML = `
      <img
        src="images/${member.id}.jpg"
        alt="${member.name}"
      >
      <h3>${member.name}</h3>
      <p>${member.group}</p>
    `;

    card.addEventListener("click",() => {
        selectMergeMember(member, card);
      }
    );

    area.appendChild(card);
  });
}

// ----------------------------------------
// 最終順位の進捗
// ----------------------------------------

function updateFinalProgress() {

  const rank =
    currentGroupRanking.length + 1;

  document.getElementById("finalProgress").textContent =
    `${currentFinalGroup + 1} / ${finalGroups.length}　` +
    `次は${rank}位を選んでください`;
}

// ========================================
// 決勝戦：6人の最終順位決定
// ========================================

let final6Ranking = [];
let final6Members = [];
let final6CurrentMemberIndex = 0;
let final6InsertIndex = 0;


// ----------------------------------------
// 6人の決勝戦を開始
// ----------------------------------------

function startFinalRanking6() {
  finalScreenMode = "finalBattle";
  console.log("top6Ranking", top6Ranking);
  console.log("人数", top6Ranking.length);

  document.getElementById("finalScreen").hidden = false;

  final6Members = [...top6Ranking];

  // 第2ラウンドの順位を基準に並べる
  final6Members.sort(
    (a, b) => a.stage1Rank - b.stage1Rank
  );

  final6Ranking = [];

  final6CurrentMemberIndex = 0;
  final6InsertIndex = 0;

  showFinal6Comparison();
}

// ----------------------------------------
// 2択の比較画面
// ----------------------------------------

function showFinal6Comparison() {

  console.log(
  "current",
  final6CurrentMemberIndex,
  "/",
  final6Members.length
);

  // 全員の順位が決まった
  if (
    final6CurrentMemberIndex >=
    final6Members.length
  ) {
    showFinal6Result();
    return;
  }

  // 最初の1人
  if (final6Ranking.length === 0) {

    final6Ranking.push(
      final6Members[final6CurrentMemberIndex]
    );

    final6CurrentMemberIndex++;

    showFinal6Comparison();

    return;
  }
  const currentMember =
    final6Members[final6CurrentMemberIndex];

  // 下位側から比較する
  const targetIndex =
    final6Ranking.length - 1 - final6InsertIndex;

  const targetMember =
    final6Ranking[targetIndex];


  document.getElementById("finalTitle").textContent =
    "ROUND3";

  document.getElementById("finalProgress").textContent =
    "1人選んでください";


  const area =
    document.getElementById("finalArea");

  area.innerHTML = "";


  // 現在のメンバー
  const currentCard =
    document.createElement("div");

  currentCard.className =
    "finalCard";

  currentCard.innerHTML = `
    <img
      src="images/${currentMember.id}.jpg"
      alt="${currentMember.name}"
    >
    <h3>${currentMember.name}</h3>
    <p>${currentMember.group}</p>
  `;

  currentCard.addEventListener(
    "click",
    () => {
      selectFinal6Member(currentMember);
    }
  );

  // 比較対象
  const targetCard =
    document.createElement("div");

  targetCard.className =
    "finalCard";

  targetCard.innerHTML = `
    <img
      src="images/${targetMember.id}.jpg"
      alt="${targetMember.name}"
    >
    <h3>${targetMember.name}</h3>
    <p>${targetMember.group}</p>
  `;

  targetCard.addEventListener(
    "click",
    () => {
      selectFinal6Member(targetMember);
    }
  );

  area.appendChild(currentCard);
  area.appendChild(targetCard);
}

// ----------------------------------------
// 2択の結果を処理
// ----------------------------------------

function selectFinal6Member(selectedMember) {

  const currentMember =
    final6Members[final6CurrentMemberIndex];


  // 現在のメンバーが上
  if (
    selectedMember.id ===
    currentMember.id
  ) {

    const insertIndex =
      final6Ranking.length -
      final6InsertIndex -
      1;

    final6Ranking.splice(
      insertIndex,
      0,
      currentMember
    );

    final6CurrentMemberIndex++;
    final6InsertIndex = 0;

    showFinal6Comparison();

    return;
  }


  // 比較対象が上
  final6InsertIndex++;


  // すべての人に負けた
  if (
    final6InsertIndex >=
    final6Ranking.length
  ) {

    final6Ranking.push(
      currentMember
    );

    final6CurrentMemberIndex++;
    final6InsertIndex = 0;

    showFinal6Comparison();

    return;
  }


  showFinal6Comparison();
}

// ----------------------------------------
// 最終結果
// ----------------------------------------

function showFinal6Result() {

  document.getElementById("finalTitle").textContent =
    "最終結果";

  document.getElementById("finalProgress").textContent =
    "1位〜6位が決定しました";


  const area =
    document.getElementById("finalArea");

  area.innerHTML = "";


  final6Ranking.forEach(
    (member, index) => {

      const card =
        document.createElement("div");

      card.className =
        "finalCard";

      card.innerHTML = `
        <img
          src="images/${member.id}.jpg"
          alt="${member.name}"
        >
        <h3>${index + 1}位　${member.name}</h3>
        <p>${member.group}</p>
      `;

      area.appendChild(card);
    }
  );


  console.log(
    "最終順位:",
    final6Ranking
  );
}