//console.log('It worked');

var x = document.getElementById('pCoords');
var dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                  'Friday', 'Saturday'];
var dressRecs = {
  'Hot' : "loose clothes, light weight fabrics, light colors",
  'Warm' : "shorts, short sleeve shirts, light material",
  'Mild' : "pants, long sleeves",
  'Cool' : "a light sweater, sweat shirt, or light jacket",
  'Cold' : "a heavy sweater, jacket, (maybe hat)",
  'Very Cold' : "a winter coat, warm hat, gloves, scarf",
  'Freezing' : "a winter coat, layered sweater or sweatshirt, gloves, hat, scarf",
  'Below Freezing' : "a winter coat, layered sweater or sweatshirt, gloves, hat,"+
                     " scarf, thermal under-layer"
}
var flaggedConditions = ['Snow', 'Rain', 'Hail'];

main();

function main() {
  $('#btnCoords').click(function() {
    $(this).button('loading');
    getLocation()});
}

//
// API Request Functions
//
function getLocation() {
  if (navigator.geolocation) {
    $('#pCoords').html('Geting Position...');
    $('#btnCoords').attr('data-loading-text', '<i class="fa fa-spinner fa-spin"></i> Getting position');
    navigator.geolocation.getCurrentPosition(showPosition, geolocationError);
  } else {
    $('#loadBtnGroup').html("Geolocation is not supported by this browser.");
  }
}
function geolocationError(error) {
  $('#loadBtnGroup').html( 'Something went wrong while finding your location:<br>'+ 'ERROR(' + error.code + '): ' + error.message);
}
function showPosition(position) {
  $('#pCoords').html('Getting Weather Data...');
  $('#btnCoords').attr('data-loading-text', '<i class="fa fa-spinner fa-spin"></i> Getting weather data');
  getWeatherPoint(position.coords.latitude, position.coords.longitude);
  getCityName(position.coords.latitude, position.coords.longitude);
}
function getWeatherPoint(lat, long) {
  let apiPointsAddress = 'https://api.weather.gov/points/' + lat + ',' + long
  console.log(apiPointsAddress);
  let request = new XMLHttpRequest();
  console.log('getweatherpoints working');
  request.open('GET', apiPointsAddress, true);
  request.onload = function () {
    console.log('request working');
    let pointData = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400) {
      //console.log(pointData.properties.forecast);
      $('#pCoords').html('Geting Forecast...');
      $('#btnCoords').attr('data-loading-text', '<i class="fa fa-spinner fa-spin"></i> Geting forecast');
      getForcast(pointData.properties.forecast);
    } else {
    const errorMessage = document.createElement('marquee');
    errorMessage.textContent = `Unable to reach ` + apiPointsAddress;
    app.appendChild(errorMessage);
    }
  }
  request.send();
}
function getForcast(apiForecastAddress) {
  let request = new XMLHttpRequest();
  request.open('GET', apiForecastAddress + '/hourly', true);
  console.log(apiForecastAddress + '/hourly')
  request.onload = function () {
    let forecastData = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400) {
      //console.log(forecastData.properties.periods);
      forecast = forecastData.properties.periods;
      panelSetup();
    } else {
    const errorMessage = document.createElement('marquee');
    errorMessage.textContent = `Unable to reach ` + apiForecastAddress;
    app.appendChild(errorMessage);
    }
  }
  request.send();
}
function getCityName(lat, long) {
  let apiCityAddress = 'https://geo.fcc.gov/api/census/area?lat=' + lat +
                       '&lon=' + long + '&format=json';
  console.log(apiCityAddress);
  let request = new XMLHttpRequest();
  console.log('getcityname working');
  request.open('GET', apiCityAddress, true);
  request.onload = function () {
    console.log('request working');
    let cityData = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400) {
      $('#cityName').html('Geting City Name...');
      //console.log(cityData);
      let cityName = cityData.results[0].county_name;
      let stateName = cityData.results[0].state_code;
      fillCityName(cityName, stateName);
    } else {
    const errorMessage = document.createElement('marquee');
    errorMessage.textContent = `Unable to reach ` + apiCityAddress;
    app.appendChild(errorMessage);
    }
  }
  request.send();
}
//
// Cookie Functions
//
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function checkCookie(cname) {
    var  name = getCookie(cname);
    if (name != "") {
        return true;
        //console.log('true');
    } else {
        // Cookie ddoes not exist
        return false;
        //console.log('false');
    }
}
//
// Page Functions
//
function panelSetup() {
  let forecastData = forecast;
  let fLen = 48; //number of hours into the forecast we get
  let lastTimeQual = "";
  let forecastList =[]
  let tempList = []
  //console.log(forecastData);
  $('#locationPanel').fadeOut('slow', function(){
    $('#locationPanel').remove();
    $('#main').html(`<div class="panel-group" style="display: none;"
      id="dashboard"></div>`);
    // Create first empty panel
    let day = dayQualifier(new Date(forecastData[0].startTime));
    let timeQual = timeQualifier(
        (new Date(forecastData[0].startTime)).getHours());
    let lastTimeQual = timeQual;
    createPanel(day, lastTimeQual);
    // Iterate through hours to add info to panels
    for (var i = 0; i < fLen; i++) {
      day = dayQualifier(new Date(forecastData[i].startTime));
      timeQual = timeQualifier(
        (new Date(forecastData[i].startTime)).getHours());
      if (timeQual != lastTimeQual) {
        // Publish info to last panel
        fillPanel(tempList, forecastList);
        // Create new box to hold info
        createPanel(day, timeQual);
        // Clear lists
        tempList = [];
        forecastList = [];
      }
      forecastList.push(forecastData[i].shortForecast);
      tempList.push(forecastData[i].temperature);
      lastTimeQual = timeQual;
    }
    fillPanel(tempList, forecastList);
    $('#dashboard').fadeIn(console.log('Fading in...'));
  });
}
function createPanel(day, timeQual) {
  $('#dashboard').append(`
    <div class="panel panel-default ` + day + `">
      <div class="panel-heading">`
      + day + ` ` + timeQual +
      `</div>
      <div class="panel-body">
        <p class="panel-text">
        </p>
      </div>
    </div>
  `);
}
function fillPanel(tempList, forecastList) {
  console.log("Filling panel")
  let avgTemp = 0;
  let total = 0;
  for (var i = 0; i < tempList.length; i++) {
    total += tempList[i];
  }
  avgTemp = Math.round(total/tempList.length);
  let conditionFill = flaggedConditionsFill(forecastList);
  let forecastMode = listMode(forecastList)['value'];
  $('#dashboard .panel-text').last().html(
    `The temperature will be ` + avgTemp + `F`+ `<br>` +
    `The forecast is ` + forecastMode.toLowerCase() + `<br>` +
    conditionFill + `<br>` +
    `You should wear ` + dressRecs[tempQualifier(avgTemp)]
  );
}
function fillCityName(cityName, stateName) {
  $('#cityName').html(cityName + ', ' + stateName);
}
//
// Formatting Functions
//
function timeQualifier(hour24) {
  let qualifier = "";
  if ((hour24 >= 0 && hour24 < 6) || (hour24 >= 22 && hour24 < 24)) {
     qualifier = "Night";
  } else if (hour24 >= 6 && hour24 < 10) {
     qualifier = "Morning";
  } else if (hour24 >= 10 && hour24 < 16) {
     qualifier = "Day";
  } else if (hour24 >= 16 && hour24 < 18) {
     qualifier = "Evening";
  } else if (hour24 >= 18 && hour24 < 22) {
     qualifier = "Evening";
  } else {
     qualifier = "Invalid time";
  }
  //console.log(qualifier);
  return(qualifier);
}
function tempQualifier(tempF) {
  let temp = parseInt(tempF, 10);
  let qualifier = "";
  if (temp >= 80) {
     qualifier = "Hot";
  } else if (temp >= 70 && temp < 80) {
     qualifier = "Warm";
  } else if (temp >= 60 && temp < 70) {
     qualifier = "Mild";
  } else if (temp >= 50 && temp < 60) {
     qualifier = "Cool";
  } else if (temp >= 40 && temp < 50) {
     qualifier = "Cold";
  } else if (temp > 32 && temp < 40) {
     qualifier = "Very Cold";
  } else if (temp >= 25 && temp <= 32) {
     qualifier = "Freezing";
  } else if (temp < 25) {
     qualifier = "Below Freezing";
  } else {
     qualifier = "Invalid temp";
  }
  //console.log(qualifier);
  return(qualifier);
}
function flaggedConditionsFill(forecastList) {
  //console.log(forecastList.length);
  //console.log(flaggedConditions.length);
  let flen = forecastList.length;
  let clen = flaggedConditions.length;
  //console.log('Attempting to flag conditions');
  for (var i=0; i < flen; i++) {
    for (var j=0; j < clen; j++) {
      if (forecastList[i].includes(flaggedConditions[j])) {
        return "There is a chance of " + flaggedConditions[j].toLowerCase() + `<br>`;
      }
    }
  }
  return "";
}
function dayQualifier(dateI) {
  let qualifier = ""
  let day0 = (new Date()).getDay();
  let day1 = dateI.getDay();
  if (day0 == day1) {
    //i.e. today
    return("");
  } else {
    return(dayOfWeek[day1] + " ");
  }
}
function hourFormat(isoTime) {
  let hour24 = (new Date(isoTime)).getHours();
  let hourAmPm = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  hour12 = hour12 ? hour12 : 12;
  return hour12 + ' ' + hourAmPm;
}
function listMode(inList) {
  if (inList.length == 0) {
    return null;
  }
  let modeNum = {};
  let maxElement = inList[0];
  let maxCount = 1;
  let element = inList[i];
  for (var i=0; i<inList.length; i++) {
    element = inList[i];
    if (modeNum[element] == 0) {
      modeNum[element] = 1;
    } else {
      modeNum[element]++;
    }
    if (modeNum[element] > maxCount) {
      maxCount = modeNum[element];
      maxElement = element;
    }
  }
  return {"value" : maxElement,
          "count" : maxCount};
}
