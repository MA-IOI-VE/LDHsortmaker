async function createResultImage(designFile) {

    
  // 日付と名前を取得
    const userName = document.getElementById("resultUserName").value;

    const now = new Date();

    const resultDate =
        now.getFullYear() +
        "." +
        String(now.getMonth() + 1).padStart(2, "0") +
        "." +
        String(now.getDate()).padStart(2, "0");

  // 最終順位6人を取得
  const members = final6Ranking.slice(0, 6);

  // 透過PNGを読み込む
  const designImage = new Image();

  designImage.src = designFile;

  await designImage.decode();

  // 透過PNGと同じサイズのCanvasを作る
  const canvas = document.createElement("canvas");

  canvas.width = designImage.width;
  canvas.height = designImage.height;

  const ctx = canvas.getContext("2d");

  // 6人の画像を読み込む
  const memberImages = await Promise.all(
    members.map(member => {

      return new Promise((resolve, reject) => {

        const img = new Image();

        img.src = `images/${member.id}.jpg`;

        img.onload = () => resolve(img);
        img.onerror = reject;

      });

    })
  );


// ========================================
// メンバー画像の配置
// ========================================

    const positions = [

    // 1位
    { x: 415, y: 288, w: 370, h: 370 },

    // 2位
    { x: 98, y: 462, w: 284, h: 284 },

    // 3位
    { x: 818, y: 462, w: 284, h: 284 },

    // 4位
    { x: 112, y: 793, w: 270, h: 270 },

    // 5位
    { x: 465, y: 793, w: 270, h: 270 },

    // 6位
    { x: 819, y: 793, w: 270, h: 270 }

    ];

    memberImages.forEach((img, index) => {

    const pos = positions[index];

    ctx.drawImage(
        img,
        pos.x,
        pos.y,
        pos.w,
        pos.h
    );

    });

// ========================================
// 透過PNGを重ねる
// ========================================

  ctx.drawImage(
    designImage,
    0,
    0,
    canvas.width,
    canvas.height
  );


// ========================================
// 名前・グループ名
// ========================================

const resultMembers = final6Ranking.slice(0, 6);

resultMembers.forEach((member, index) => {

  const pos = positions[index];

  // 文字を中央揃え
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // --------------------
  // 1位
  // --------------------
  if (index === 0) {

    // 名前
    ctx.font = 'bold 65px sans-serif';

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 5;
    ctx.strokeText(
      member.name,
      600,
      675
    );

    ctx.fillStyle = "#333333";
    ctx.fillText(
      member.name,
      600,
      675
    );

    // グループ名
    ctx.font = '25px sans-serif';

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.strokeText(
      member.group,
      600,
      725
    );

    ctx.fillStyle = "#333333";
    ctx.fillText(
      member.group,
      600,
      725
    );
  }

  // --------------------
  // 2～3位
  // --------------------
  else if (index <= 2) {

    // 名前
    ctx.font = 'bold 30px sans-serif';

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 3;
    ctx.strokeText(
      member.name,
      pos.x + pos.w / 2,
      pos.y + pos.h - 40
    );

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      member.name,
      pos.x + pos.w / 2,
      pos.y + pos.h - 40
    );

    // グループ名
    ctx.font = '18px sans-serif';

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 3;
    ctx.strokeText(
      member.group,
      pos.x + pos.w / 2,
      pos.y + pos.h - 15
    );

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      member.group,
      pos.x + pos.w / 2,
      pos.y + pos.h - 15
    );
  }

  // --------------------
  // 4～6位
  // --------------------
  else {

    // 名前
    ctx.font = 'bold 30px sans-serif';

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 3;
    ctx.strokeText(
      member.name,
      pos.x + pos.w / 2,
      pos.y + pos.h - 32
    );

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      member.name,
      pos.x + pos.w / 2,
      pos.y + pos.h - 32
    );
  }

});

// ========================================
// 作成日・名前
// ========================================

ctx.textAlign = "center";
ctx.textBaseline = "middle";

let infoText = resultDate;

if (userName) {
  infoText += "　" + userName;
}

ctx.font = 'italic 25px "Open Sans", sans-serif';
ctx.fillStyle = "#333B22";

ctx.fillText(
  infoText,
  canvas.width / 2,
  1150
);


// ========================================
// 書き出し・配置
// ========================================

  const resultData =
    canvas.toDataURL("image/png");


  // 結果画像にセット
  const resultImage =
    document.getElementById("resultImage");

  resultImage.src = resultData;


  // 結果画像画面へ移動
  document.getElementById("resultScreen").hidden = true;

  document.getElementById("resultImageScreen").hidden = false;
}
