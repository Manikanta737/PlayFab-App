const PlayFab =("playfab-sdk");

const playfab = PlayFab;

playfab.settings.titleId = "25D26";

const loginContainer = document.getElementById("login-container");
const homeContainer = document.getElementById("home-container");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-btn");
const usernameElement = document.getElementById("username");
const weatherButton = document.getElementById("weather-btn");
const temperatureElement = document.getElementById("temperature");
const historyButton = document.getElementById("history-btn");
const temperatureHistoryElement = document.getElementById("temperature-history");
const storeNameButton = document.getElementById("store-name-btn");
const logoutButton = document.getElementById("logout-btn");
const weatherContainer = document.getElementById("weather-container");
const historyContainer = document.getElementById("history-container");

loginButton.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  playfab.ClientLoginWithEmailAddress({
    Email: email,
    Password: password,
  }, (result, error) => {
    if (error) {
      console.error("Login failed:", error.errorMessage);
    } else {
      console.log("Login successful:", result);
      loginContainer.style.display = "none";
      homeContainer.style.display = "block";
      usernameElement.textContent = result.data.InfoResultPayload.AccountInfo.Username;
    }
  });
});

weatherButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(position => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const apiKey = "ae7300120a48f5926b14ef222c5c7af5";
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    fetch(weatherUrl)
      .then(response => response.json())
      .then(data => {
        const temperature = data.main.temp;
        console.log("Current temperature:", temperature);

        playfab.ClientUpdateUserData({
          Data: { "temperature": temperature },
        }, (result, error) => {
          if (error) {
            console.error("Failed to store temperature:", error.errorMessage);
          } else {
            console.log("Temperature stored successfully");
          }
        });

        weatherContainer.style.display = "block";
        temperatureElement.textContent = `${temperature}°C`;
      })
      .catch(error => {
        console.error("Failed to fetch weather data:", error);
      });
  });
});

historyButton.addEventListener("click", () => {
  playfab.ClientGetUserData({}, (result, error) => {
    if (error) {
      console.error("Failed to fetch temperature history:", error.errorMessage);
    } else {
      const userData = result.data.Data;
      if ("temperature" in userData) {
        const temperatures = userData.temperature.Value;
        console.log("Temperature history:", temperatures);

        historyContainer.style.display = "block";
        temperatureHistoryElement.innerHTML = "";
        temperatures.forEach(temp => {
          const li = document.createElement("li");
          li.textContent = `${temp}°C`;
          temperatureHistoryElement.appendChild(li);
        });
      }
    }
  });
});

storeNameButton.addEventListener("click", () => {
  const newName = prompt("Enter your name:");
  if (newName) {
    playfab.ClientUpdateUserTitleDisplayName({
      DisplayName: newName,
    }, (result, error) => {
      if (error) {
        console.error("Failed to store name:", error.errorMessage);
      } else {
        console.log("Name stored successfully");
        usernameElement.textContent = newName;
      }
    });
  }
});

logoutButton.addEventListener("click", () => {
  loginContainer.style.display = "block";
  homeContainer.style.display = "none";
  weatherContainer.style.display = "none";
  historyContainer.style.display = "none";
});

module.exports = {};
