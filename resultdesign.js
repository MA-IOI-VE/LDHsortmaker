async function createResultImage(designFile) {

   console.log("createResultImage開始");

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
    { x: 400, y: 290, w: 385, h: 368 },

    // 2位
    { x: 99, y: 462, w: 281, h: 282 },

    // 3位
    { x: 818, y: 462, w: 284, h: 282 },

    // 4位
    { x: 112, y: 793, w: 268, h: 270 },

    // 5位
    { x: 465, y: 793, w: 269, h: 270 },

    // 6位
    { x: 818, y: 793, w: 269, h: 270 }

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


  // 最後に透過PNGを重ねる
  ctx.drawImage(
    designImage,
    0,
    0,
    canvas.width,
    canvas.height
  );


  // PNGとして書き出す
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
