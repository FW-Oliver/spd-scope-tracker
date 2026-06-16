console.log("Script loaded!");

const scriptURL = "https://script.google.com/macros/s/AKfycbyx5zodizevD4IJf5oMUIz1yBuzk9x2N6FXzr61U8INwNdxPDT6uIpMclT8gOU34zt2/exec";

let scopes = [];

fetch(scriptURL)
  .then(response => response.json())
  .then(data => {

    console.log(data);

    scopes = data.map(scope => ({

      cabinet: scope["Cabinet"],
      position: scope["Position"],
      startDate: scope["Start Date"],
      permanent: scope["Permanent"]
    }));

    renderScopes();

  });
/*
const scopes = [
  { cabinet: 1, position: 1, permanent: true },
  { cabinet: 1, position: 2, permanent: true },
  { cabinet: 1, position: 3, permanent: true },
  { cabinet: 1, position: 4, permanent: true },
  { cabinet: 1, position: 5, permanent: true },
  { cabinet: 1, position: 6, permanent: true },
  { cabinet: 1, position: 7, startDate: "2026-06-12" },
  { cabinet: 1, position: 8, startDate: "2026-06-16" },

  { cabinet: 2, position: 9 },
  { cabinet: 2, position: 10, startDate: "2026-06-12" },
  { cabinet: 2, position: 11, startDate: "2026-06-12" },
  { cabinet: 2, position: 12, startDate: "2026-06-12" },
  { cabinet: 2, position: 13, startDate: "2026-06-12" },
  { cabinet: 2, position: 14, startDate: "2026-06-12" },
  { cabinet: 2, position: 15, startDate: "2026-06-12" },
  { cabinet: 2, position: 16, startDate: "2026-06-12" },

  { cabinet: 3, position: 17, startDate: "2026-06-12" },
  { cabinet: 3, position: 18, startDate: "2026-06-10" },
  { cabinet: 3, position: 19, startDate: "2026-06-06" },
  { cabinet: 3, position: 20, startDate: "2026-06-04" },
  { cabinet: 3, position: 21, startDate: "2026-06-07" },
  { cabinet: 3, position: 22, startDate: "2026-06-01" },
  { cabinet: 3, position: 23, startDate: "2026-05-01" },
  { cabinet: 3, position: 24, startDate: "2026-06-12" }
];
*/

function getStatus(scope) {

  if (scope.permanent) {
    return {
      status: "NO EXPIRY",
      daysText: ""
    };
  }

  if (!scope.startDate) {
    return {
      status: "OFF",
      daysText: ""
    };
  }

  const today = new Date();

  const startDate = new Date(scope.startDate);

  const expiryDate = new Date(startDate);

  expiryDate.setDate(expiryDate.getDate() + 7);

  const daysRemaining =
    Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: "OVERDUE",
      daysText: `${Math.abs(daysRemaining)} days overdue`
    };
  }

  if (daysRemaining === 0) {
    return {
      status: "TODAY",
      daysText: "Expires today"
    };
  }

  if (daysRemaining <= 2) {
    return {
      status: "WARNING",
      daysText: `${daysRemaining} days left`
    };
  }

  return {
    status: "GOOD",
    daysText: `${daysRemaining} days left`
  };

}

function renderScopes() {

  document.getElementById("cabinet1").innerHTML = "";
  document.getElementById("cabinet2").innerHTML = "";
  document.getElementById("cabinet3").innerHTML = "";

let overdueCount = 0;
let todayCount = 0;
let warningCount = 0;
let goodCount = 0;
let offCount = 0;
let noExpiryCount = 0;

scopes.forEach((scope, index) => {

    const result = getStatus(scope);

    switch (result.status) {

      case "OVERDUE":
        overdueCount++;
        break;

      case "TODAY":
        todayCount++;
        break;

      case "WARNING":
        warningCount++;
        break;

      case "GOOD":
        goodCount++;
        break;

      case "OFF":
        offCount++;
        break;

      case "NO EXPIRY":
        noExpiryCount++;
        break;

    }

    const card = document.createElement("div");

    card.className =
      "scope-card " +
      result.status.toLowerCase().replace(" ", "-");

    card.innerHTML = `
      <h3>Scope ${scope.position}</h3>

      <div class="status">
        ${result.status}
      </div>

      <div class="days">
        ${result.daysText}
      </div>

      <br>

      <button class="start-btn">
        🟢 START
      </button>

      <button class="off-btn">
        ⚪ OFF
      </button>

      <button class="edit-btn">
        ✏ EDIT
      </button>
    `;

    document
      .getElementById(`cabinet${scope.cabinet}`)
      .appendChild(card);
    // START button
    
          card.querySelector(".start-btn").onclick = () => {

            fetch(scriptURL, {

              method: "POST",

              body: JSON.stringify({

                action: "START",

                position: scope.position

              })

            })

            .then(() => location.reload());

          };


// OFF button
card.querySelector(".off-btn").onclick = () => {

  delete scopes[index].startDate;

  renderScopes();

};


// EDIT button
card.querySelector(".edit-btn").onclick = () => {

  let days = prompt(
    "How many days remaining?",
    "7"
  );

  if (days === null)
    return;

  days = parseInt(days);

  if (isNaN(days))
    return;

  let startDate = new Date();

  startDate.setDate(
    startDate.getDate() - (7 - days)
  );

  scopes[index].startDate =
    startDate.toISOString().split("T")[0];

  renderScopes();

};

  });

    document.getElementById("overdue-count").textContent =
      overdueCount;

    document.getElementById("today-count").textContent =
      todayCount;

    document.getElementById("warning-count").textContent =
      warningCount;

    document.getElementById("good-count").textContent =
      goodCount;

    document.getElementById("off-count").textContent =
      offCount;

    document.getElementById("no-expiry-count").textContent =
      noExpiryCount;

}

// renderScopes();

