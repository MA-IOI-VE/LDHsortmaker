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
      group: line.slice(secondComma + 1)
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
  // 仮の判定結果を作る
  results.love = [...members.slice(0, 25)];
  results.like = [...members.slice(25, 55)];
  results.normal = [...members.slice(55, 85)];

  // 第2ラウンド説明画面を表示
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
      ? window.innerWidth * 1.2
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
    "transform 0.35s ease-out";

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


// ----------------------------------------
// カードを掴んだとき
// ----------------------------------------

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

const round2Intro = document.getElementById("round2Intro");
const round2IntroText = document.getElementById("round2IntroText");
const round2StartButton =
  document.getElementById("round2StartButton");

function showRound2Intro() {
  document.getElementById("sortScreen").hidden = true;
  round2Intro.hidden = false;

  if (results.love.length >= 20) {
    round2IntroText.textContent =
      "第2ラウンドへ進めるのは20人までです。残念ながら予選敗退にするメンバーを「n人」選択して「NEXT」を押してください。";
  } else {
    round2IntroText.textContent =
      "「特別」に選んだメンバーは全員予選を通過します。残りの枠は「好き」から選びます。6人ずつ表示されるので、その中から「1~4人まで」を「好きな順番に」選んで「NEXT」を押してください。";
  }
}


// ========================================
// 第2ラウンド開始ボタン
// ========================================

// ----------------------------------------
// 第2ラウンド開始ボタン
// ----------------------------------------

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

  if (results.love.length >= 20) {
    startLoveSelection();
  } else {
    startLikeSelection();
  }
}


// ----------------------------------------
// ❤️メンバーから選ぶ
// ----------------------------------------

let round2LikeMembers = [];
let round2LikeIndex = 0;
let round2LikeSelected = [];
let round2LikeOrder = [];
let finalGroups = [];


function startLikeSelection() {
  // 💖は全員通過
  const remainingSlots = 20 - results.love.length;

  round2LikeMembers = [...results.like];
  round2LikeIndex = 0;
  round2LikeSelected = [];

  document.getElementById("round2Progress").textContent =
    `残り${remainingSlots}人を選んでください`;

  showLikeGroup();
}

// ----------------------------------------
// ❤️6人のグループを表示
// ----------------------------------------

function showLikeGroup() {
  const area = document.getElementById("round2Area");

  area.innerHTML = "";
  round2LikeSelected = [];

  const group = round2LikeMembers.slice(
    round2LikeIndex,
    round2LikeIndex + 6
  );

  group.forEach(member => {
    const card = document.createElement("div");

    card.className = "round2Card";

    card.innerHTML = `
      <img src="images/${member.id}.jpg" alt="${member.name}">
      <h3>${member.name}</h3>
      <p>${member.group}</p>
    `;

    card.addEventListener("click", () => {
      toggleLikeSelection(member, card);
    });

    area.appendChild(card);
  });

 updateLikeProgress();
updateLikeButton();
}


// ----------------------------------------
// ❤️「次へ」ボタンの状態
// ----------------------------------------

function updateLikeButton() {
  const button =
    document.getElementById("round2ConfirmButton");

  const remainingSlots = 20 - results.love.length;

  // 今回のグループで選ぶ必要がある人数
  const currentGroupSize = Math.min(
    6,
    round2LikeMembers.length - round2LikeIndex
  );

  // このグループで選べる最大人数
  const maxSelectable = Math.min(
    4,
    remainingSlots,
    currentGroupSize
  );

  button.disabled =
    round2LikeSelected.length !== maxSelectable;

  button.textContent =
    `NEXT（${round2LikeSelected.length} / ${maxSelectable}）`;
}


// ----------------------------------------
// ❤️選択・選択解除
// ----------------------------------------

function toggleLikeSelection(member, card) {
  const index = round2LikeSelected.findIndex(
    person => person.id === member.id
  );

  // ----------------------------------------
  // 選択解除
  // ----------------------------------------

  if (index !== -1) {
    round2LikeSelected.splice(index, 1);

    const orderIndex = round2LikeOrder.findIndex(
      person => person.id === member.id
    );

    if (orderIndex !== -1) {
      round2LikeOrder.splice(orderIndex, 1);
    }

    card.classList.remove("eliminated");

    updateLikeProgress();
    updateLikeButton();

    return;
  }


  // ----------------------------------------
  // 選択
  // ----------------------------------------

  const remainingSlots = 20 - results.love.length;

  if (round2LikeSelected.length >= 4) {
    return;
  }

  if (round2LikeSelected.length >= remainingSlots) {
    return;
  }

  round2LikeSelected.push(member);

  // 選択した順番を記録
  round2LikeOrder.push(member);

  card.classList.add("eliminated");

  updateLikeProgress();
  updateLikeButton();
}

// ----------------------------------------
// ❤️選択人数の表示
// ----------------------------------------

function updateLikeProgress() {
  const remainingSlots = 20 - results.love.length;

  document.getElementById("round2Progress").textContent =
    `${round2LikeSelected.length}/${remainingSlots}`;
}


// ----------------------------------------
// 💖メンバーから予選敗退者を選ぶ
// ----------------------------------------

function startLoveSelection() {
  const loveMembers = [...results.love];

  const eliminateCount = loveMembers.length - 20;

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
    const eliminateCount = results.love.length - 20;

    if (round2Eliminated.length >= eliminateCount) {
      return;
    }

    round2Eliminated.push(member);
    card.classList.add("eliminated");
  }

  updateRound2Button(results.love.length - 20);
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

  // ----------------------------------------
  // 💖が20人以上の場合
  // ----------------------------------------

  if (results.love.length >= 20) {
    const loveMembers = results.love;

    results.love = loveMembers.filter(
      member =>
        !round2Eliminated.some(
          eliminated => eliminated.id === member.id
        )
    );

    console.log("第2ラウンド通過者:", results.love);
    console.log("通過人数:", results.love.length);

    document.getElementById("round2Progress").textContent =
  `第2ラウンド通過：${results.love.length}人`;

  finalGroups = createFinalGroups();

  console.log("最終グループ:", finalGroups);

startFinalRanking();

return;
  }


  // ----------------------------------------
  // ❤️から選ぶ場合
  // ----------------------------------------

  const remainingSlots = 20 - results.love.length;

  // 選択したメンバーを記録
  round2LikeSelected.forEach(member => {
    results.love.push(member);
  });

  // 次の6人へ
  round2LikeIndex += 6;

  // 20人集まった
  if (results.love.length >= 20) {
  console.log("第2ラウンド通過者:", results.love);
  console.log("通過人数:", results.love.length);

  // 20人を5グループに分ける
  finalGroups = createFinalGroups();

  console.log("最終グループ:", finalGroups);

  document.getElementById("round2Progress").textContent =
  "20人が決定しました";

startFinalRanking();

return;
}

  // まだ残り枠がある
  showLikeGroup();
});


// ========================================
// 20人を5グループに分ける
// ========================================

function createFinalGroups() {
  const loveMembers = [...results.love];

  // ❤️の選択順
  const likeMembers = [...round2LikeOrder];

  // ----------------------------------------
  // 💖をランダムに並べる
  // ----------------------------------------

  loveMembers.sort(() => Math.random() - 0.5);


  // ----------------------------------------
  // 5グループを作る
  // ----------------------------------------

  const groups = [
    [],
    [],
    [],
    [],
    []
  ];


  // ----------------------------------------
  // ❤️を選択順に5グループへ分散
  // ----------------------------------------

  likeMembers.forEach((member, index) => {
    groups[index % 5].push(member);
  });


  // ----------------------------------------
  // 残りの枠に💖をランダム配置
  // ----------------------------------------

  const remainingLove = [...loveMembers];

  groups.forEach(group => {
    while (group.length < 4 && remainingLove.length > 0) {
      group.push(remainingLove.shift());
    }
  });


  console.log("最終5グループ:", groups);

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

// ========================================
// 全体TOP6
// ========================================

let top6Ranking = [];
let mergePositions = [0, 0, 0, 0, 0];
let mergeCandidates = [];


// ----------------------------------------
// 最終順位決定を開始
// ----------------------------------------

function startFinalRanking() {
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
    `GROUP ${currentFinalGroup + 1}`;

  document.getElementById("finalProgress").textContent =
    `${currentFinalGroup + 1} / ${finalGroups.length}`;

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

    finishFinalGroup();

    return;
  }

  updateFinalProgress();
}


// ----------------------------------------
// 最終グループの順位確定
// ----------------------------------------

function finishFinalGroup() {

  // グループごとの順位を保存
  finalGroupRankings.push([...currentGroupRanking]);

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

   // 5グループすべて終了
  console.log("グループ別順位:", finalGroupRankings);
  console.log("全グループの順位:", finalRanking);

  startTop6Merge();
}

// ========================================
// 全体TOP6決定
// ========================================

function startTop6Merge() {
  top6Ranking = [];
  mergePositions = [0, 0, 0, 0, 0];
  mergeCandidates = [];

  showMergeComparison();
}

// ----------------------------------------
// 4人の比較候補を作る
// ----------------------------------------

function showMergeComparison() {
  mergeCandidates = [];

  const excludedGroup =
    top6Ranking.length % 5;

  for (let i = 0; i < finalGroupRankings.length; i++) {
    if (i === excludedGroup) {
      continue;
    }

    const position = mergePositions[i];

    if (position < finalGroupRankings[i].length) {
      mergeCandidates.push({
        member: finalGroupRankings[i][position],
        groupIndex: i
      });
    }
  }

  console.log("今回の比較候補:", mergeCandidates);

  showMergeComparisonScreen();

}

// ----------------------------------------
// 全体TOP6の候補を選択
// ----------------------------------------

function selectMergeMember(candidate) {
  const member = candidate.member;
  const groupIndex = candidate.groupIndex;

  // TOP6に追加
  top6Ranking.push(member);

  // その人がいたグループを次の順位へ進める
  mergePositions[groupIndex]++;

  console.log(
    `${top6Ranking.length}位:`,
    member.name
  );

  // 6人決まったら終了
  if (top6Ranking.length === 6) {
  startFinalRanking6();
  return;
}

  // 次の4人を作る
  showMergeComparison();
}

// ----------------------------------------
// TOP6結果表示
// ----------------------------------------

function showTop6Result() {
  document.getElementById("finalTitle").textContent =
    "TOP 6";

  document.getElementById("finalProgress").textContent =
    "全体順位が決定しました";

  const area = document.getElementById("finalArea");

  area.innerHTML = "";

  top6Ranking.forEach((member, index) => {
    const card = document.createElement("div");

    card.className = "finalCard";

    card.innerHTML = `
      <img src="images/${member.id}.jpg" alt="${member.name}">
      <h3>${index + 1}位　${member.name}</h3>
      <p>${member.group}</p>
    `;

    area.appendChild(card);
  });

  console.log("最終TOP6:", top6Ranking);
}

// ----------------------------------------
// 全体TOP6の比較画面
// ----------------------------------------

function showMergeComparisonScreen() {
  document.getElementById("finalTitle").textContent =
    `全体TOP${top6Ranking.length + 1}候補`;

  document.getElementById("finalProgress").textContent =
    `TOP6決定　${top6Ranking.length} / 6`;

  const area = document.getElementById("finalArea");

  area.innerHTML = "";

  mergeCandidates.forEach(candidate => {
    const member = candidate.member;

    const card = document.createElement("div");

    card.className = "finalCard";

    card.innerHTML = `
      <img src="images/${member.id}.jpg" alt="${member.name}">
      <h3>${member.name}</h3>
      <p>${member.group}</p>
    `;

    card.addEventListener("click", () => {
      selectMergeMember(candidate);
    });

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
// 決勝戦：6人の順位決定
// ========================================

let final6Ranking = [];
let final6Members = [];
let final6CurrentMemberIndex = 0;
let final6InsertIndex = 0;


// ----------------------------------------
// 6人の決勝戦を開始
// ----------------------------------------

function startFinalRanking6() {

  final6Members = [...top6Ranking];

  final6Ranking = [];

  final6CurrentMemberIndex = 0;
  final6InsertIndex = 0;

  showFinal6Comparison();
}


// ----------------------------------------
// 2択の比較画面
// ----------------------------------------

function showFinal6Comparison() {

  // ----------------------------------------
  // 全員の順位が決まった
  // ----------------------------------------

  if (
    final6CurrentMemberIndex >=
    final6Members.length
  ) {
    showFinal6Result();
    return;
  }


  // ----------------------------------------
  // 1人目
  // ----------------------------------------

  if (final6Ranking.length === 0) {

    final6Ranking.push(
      final6Members[final6CurrentMemberIndex]
    );

    final6CurrentMemberIndex++;

    final6InsertIndex = 0;

    showFinal6Comparison();

    return;
  }


  // ----------------------------------------
  // 現在順位を入れたいメンバー
  // ----------------------------------------

  const currentMember =
    final6Members[final6CurrentMemberIndex];


  // ----------------------------------------
  // 比較対象
  // ----------------------------------------

  const targetMember =
    final6Ranking[final6InsertIndex];


  // ----------------------------------------
  // 画面
  // ----------------------------------------

  document.getElementById("finalTitle").textContent =
    "決勝戦";

  document.getElementById("finalProgress").textContent =
    `${final6CurrentMemberIndex + 1}人目　順位を決定`;


  const area =
    document.getElementById("finalArea");

  area.innerHTML = "";


  // ----------------------------------------
  // 現在のメンバー
  // ----------------------------------------

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


  // ----------------------------------------
  // 比較対象
  // ----------------------------------------

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


  // ----------------------------------------
  // 現在のメンバーが勝った
  // → 比較対象の前に入る
  // ----------------------------------------

  if (
    selectedMember.id ===
    currentMember.id
  ) {

    final6Ranking.splice(
      final6InsertIndex,
      0,
      currentMember
    );

    final6CurrentMemberIndex++;

    final6InsertIndex = 0;

    showFinal6Comparison();

    return;
  }


  // ----------------------------------------
  // 比較対象が勝った
  // → 次の順位と比較
  // ----------------------------------------

  final6InsertIndex++;


  // ----------------------------------------
  // 全員に負けた
  // → 最下位に入る
  // ----------------------------------------

  if (
    final6InsertIndex >=
    final6Ranking.length
  ) {

    final6Ranking.push(
      currentMember
    );

    final6CurrentMemberIndex++;

    final6InsertIndex = 0;
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