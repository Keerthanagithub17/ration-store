import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "YOUR_API_KEY", 
  databaseURL: "https://ration-store-website-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ration-store-website",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


window.login = function () {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("mapSection").classList.remove("hidden");

  initMap();
  animateStock();
  updateCrowd();
};

const statusRef = ref(db, "shopstatus");
onValue(statusRef, (snapshot) => {
  const status = snapshot.val();
  const statusEl = document.getElementById("shopStatus");

  if (status === "open") {
    statusEl.innerText = "OPEN";
    statusEl.style.background = "green";
  } else {
    statusEl.innerText = "CLOSED";
    statusEl.style.background = "red";
  }
});


let map;
let markers = [];

window.initMap = function () {
  if (map) return;

  map = L.map("map").setView([13.0827, 80.2707], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
};

window.searchNearbyStores = function () {
  const input = document.getElementById("searchBox");
  const query = input && input.value ? input.value : "ration store";

  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10`
  )
    .then(res => res.json())
    .then(data => {
      clearMarkers();

      if (data.length === 0) {
        alert("No nearby stores found");
        return;
      }

      data.forEach(place => {
        const marker = L.marker([place.lat, place.lon])
          .addTo(map)
          .bindPopup(place.display_name);

        markers.push(marker);
      });

      map.setView([data[0].lat, data[0].lon], 14);
    })
    .catch(err => console.error("Map search error:", err));
};

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}


function animateStock() {
  document.getElementById("riceStock").style.width = "70%";
  document.getElementById("wheatStock").style.width = "50%";
  document.getElementById("sugarStock").style.width = "90%";
}


function updateCrowd() {
  const crowdLevels = ["low", "medium", "high"];
  const active = crowdLevels[Math.floor(Math.random() * crowdLevels.length)];

  document.querySelectorAll("#crowdIndicator .circle").forEach(c => {
    c.style.opacity = 0.3;
    c.style.transform = "scale(0.8)";
  });

  if (active === "low") {
    document.querySelector(".circle.low").style.opacity = 1;
    document.querySelector(".circle.low").style.transform = "scale(1.2)";
  } else if (active === "medium") {
    document.querySelector(".circle.medium").style.opacity = 1;
    document.querySelector(".circle.medium").style.transform = "scale(1.2)";
  } else {
    document.querySelector(".circle.high").style.opacity = 1;
    document.querySelector(".circle.high").style.transform = "scale(1.2)";
  }
}
setInterval(updateCrowd, 3000);


function startVoice() {
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  recognition.onresult = function (event) {
    const speech = event.results[0][0].transcript.toLowerCase();
    let reply = "I didn't understand. Ask about stock or crowd.";

    if (speech.includes("rice")) reply = `Rice availability is ${document.getElementById("riceStock").style.width}`;
    else if (speech.includes("wheat")) reply = `Wheat availability is ${document.getElementById("wheatStock").style.width}`;
    else if (speech.includes("sugar")) reply = `Sugar availability is ${document.getElementById("sugarStock").style.width}`;
    else if (speech.includes("crowd")) {
      const circles = document.querySelectorAll("#crowdIndicator .circle");
      let status = "Low";
      if (circles[1].style.opacity == 1) status = "Medium";
      if (circles[2].style.opacity == 1) status = "High";
      reply = `Current crowd status is ${status}`;
    }

    speak(reply);
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
  };
}

function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}

function reserveSlot() {
  const slot = document.getElementById("timeSlot").value;
  const msg = document.getElementById("slotMsg");

  if (!slot) {
    msg.style.color = "red";
    msg.innerText = "Please select a time slot.";
    return;
  }

  msg.style.color = "green";
  msg.innerText = `✅ Your slot ${slot} has been reserved!`;
}
