$(document).ready(function() {

function initPage() {
    const inputElement = document.getElementById("cityInputElement");
    const searchElement = document.getElementById("searchButton");
    const clearElement = document.getElementById("clearHistory");
    const nameElement = document.getElementById("cityNameElement");
    const currentPicElement = document.getElementById("weatherIcon");
    const currentTempEl = document.getElementById("temperature");
    const currentHumidityEl = document.getElementById("humidity");
    const currentWindEl = document.getElementById("windSpeed");
    const currentUVElement = document.getElementById("uvIndex");
    const historyElement = document.getElementById("history");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    
    const APIKey = "f9b52cd0a6923dc341ec2b06a4eb3371";
//  When search button is clicked, read the city name typed by the user

    function getWeather(cityName) {
//  Using saved city name, execute a current condition get request from open weather map api
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        $.ajax({
            url: queryURL,
            method: "GET"
          }).then(function(response) {
        //  Parse response to display current conditions
        //  Method for using "date" objects obtained from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
            const currentDate = new Date(response.dt*1000);
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            nameElement.innerHTML = response.name + " (" + month + "/" + day + "/" + year + ") ";
            let weatherPic = response.weather[0].icon;
            currentPicElement.setAttribute("src","https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
            currentPicElement.setAttribute("alt",response.weather[0].description);
            currentTempEl.innerHTML = "Temperature: " + convertKelvin(response.main.temp) + " &#176F";
            currentHumidityEl.innerHTML = "Humidity: " + response.main.humidity + "%";
            currentWindEl.innerHTML = "Wind Speed: " + response.wind.speed + " MPH";

            let lat = response.coord.lat;
            let lon = response.coord.lon;
            let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;

            $.ajax({
                url: UVQueryURL,
                method: "GET"
            }).then(function(response) {
                let uvNumber = parseFloat(response.value,2);
                let UVIndex = document.createElement("span");

                // Display color red for uv >= 5, color yellow for uv between 2 and 5, color green for uv <= 2.
                if (uvNumber >= 5 ) {
                    UVIndex.setAttribute("class","badge badge-danger");
                } else if (uvNumber > 2) {
                    UVIndex.setAttribute("class","badge badge-warning");
                  } else {
                    UVIndex.setAttribute("class","badge badge-success");
                  }

                UVIndex.innerHTML = response.value;
                currentUVElement.innerHTML = "UV Index: ";
                currentUVElement.append(UVIndex);
            });

//  Using saved city name, execute a 5-day forecast get request from open weather map api
            let cityID = response.id;
            let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;

            $.ajax({
                url: forecastQueryURL,
                method: "GET"
            })
            .then(function(response) {
    //  Parse response to display forecast for next 5 days underneath current conditions
                const forecastEls = document.querySelectorAll(".forecast");
                for (i=0; i<forecastEls.length; i++) {
                    forecastEls[i].innerHTML = "";
                    const forecastIndex = i * 8 + 4;
                    const forecastDate = new Date(response.list[forecastIndex].dt * 1000);
                    const forecastDay = forecastDate.getDate();
                    const forecastMonth = forecastDate.getMonth() + 1;
                    const forecastYear = forecastDate.getFullYear();
                    const forecastDateEl = document.createElement("p");
                    forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
                    forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                    forecastEls[i].append(forecastDateEl);
                    const forecastWeatherEl = document.createElement("img");
                    forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.list[forecastIndex].weather[0].icon + "@2x.png");
                    forecastWeatherEl.setAttribute("alt",response.list[forecastIndex].weather[0].description);
                    forecastEls[i].append(forecastWeatherEl);
                    const forecastTempEl = document.createElement("p");
                    forecastTempEl.innerHTML = "Temp: " + convertKelvin(response.list[forecastIndex].main.temp) + " &#176F";
                    forecastEls[i].append(forecastTempEl);
                    const forecastHumidityEl = document.createElement("p");
                    forecastHumidityEl.innerHTML = "Humidity: " + response.list[forecastIndex].main.humidity + "%";
                    forecastEls[i].append(forecastHumidityEl);
                }
            });
        });  
    }

    searchElement.addEventListener("click",function() {
        const searchTerm = inputElement.value;
        if (searchTerm === "") {
            return;
        }
        getWeather(searchTerm);
        let storeSearch = true;
        for (i=0; i<searchHistory.length; i++) {
            if (searchTerm === searchHistory[i]) {
                storeSearch = false;
            }
        }

        if (storeSearch) {
            searchHistory.push(searchTerm);
            localStorage.setItem("search",JSON.stringify(searchHistory));
        }

        renderButton();
    })

    clearElement.addEventListener("click",function() {
        searchHistory = [];
        renderButton();
    })

    function convertKelvin(K) {
        return Math.floor((K - 273.15) * 1.8 +32);
    }

    function renderButton() {
        historyElement.innerHTML = "";
        for (let i=0; i<searchHistory.length; i++) {
            const historyItem = document.createElement("input");
            // <input type="text" readonly class="form-control-plaintext" id="staticEmail" value="email@example.com"></input>
            historyItem.setAttribute("type","text");
            historyItem.setAttribute("readonly",true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            historyItem.addEventListener("click",function() {
                getWeather(historyItem.value);
            })
            historyElement.append(historyItem);
        }
    }

    renderButton();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }


//  Save user's search requests and display them underneath search form
//  When page loads, automatically generate current conditions and 5-day forecast for the last city the user searched for

}
initPage();

});