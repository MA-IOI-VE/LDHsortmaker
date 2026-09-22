const startButton = document.getElementById("startButton");

let members = [];

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

  console.log("読み込んだ人数:", members.length);
  console.log(members);
}

loadMembers();

startButton.addEventListener("click", () => {
  if (members.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * members.length);
  const member = members[randomIndex];

  document.getElementById("sortScreen").hidden = false;
  startButton.hidden = true;

  document.getElementById("progress").textContent =
    `1 / ${members.length}`;

  document.getElementById("memberImage").src =
    `images/${member.id}.jpg`;

  document.getElementById("memberImage").alt =
    member.name;

  document.getElementById("memberName").textContent =
    member.name;

  document.getElementById("memberGroup").textContent =
    member.group;
});