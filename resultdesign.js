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

  // 3列 × 2行
  const columns = 3;
  const rows = 2;

  const cellWidth =
    canvas.width / columns;

  const cellHeight =
    canvas.height / rows;


  // 6人の画像を配置
  memberImages.forEach((img, index) => {

    const column =
      index % columns;

    const row =
      Math.floor(index / columns);

    const x =
      column * cellWidth;

    const y =
      row * cellHeight;


    // 縦横比を維持してセルいっぱいに表示
    const imageRatio =
      img.width / img.height;

    const cellRatio =
      cellWidth / cellHeight;

    let drawWidth;
    let drawHeight;

    if (imageRatio > cellRatio) {

      drawHeight = cellHeight;
      drawWidth =
        drawHeight * imageRatio;

    } else {

      drawWidth = cellWidth;
      drawHeight =
        drawWidth / imageRatio;

    }

    // 中央配置
    const drawX =
      x + (cellWidth - drawWidth) / 2;

    const drawY =
      y + (cellHeight - drawHeight) / 2;


    ctx.drawImage(
      img,
      drawX,
      drawY,
      drawWidth,
      drawHeight
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
