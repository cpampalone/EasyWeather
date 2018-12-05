//console.log('It worked');

var x = document.getElementById('pCoords');
var dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                  'Friday', 'Saturday'];
var dressRecs = {
  'Hot' : "Loose clothes, light weight fabrics, light colors",
  'Warm' : "Shorts, short sleeve shirts, light material",
  'Mild' : "Pants, long sleeves",
  'Cool' : "Light Sweater, sweat shirt, or light jacket",
  'Cold' : "Heavy sweater, jacket, (maybe hat)",
  'Very Cold' : "Winter coat, warm hat, gloves, scarf",
  'Freezing' : "Winter coat, layered sweater or sweatshirt, gloves, hat, scarf",
  'Below Freezing' : "Winter coat, layered sweater or sweatshirt, gloves, hat,"+
                     " scarf, thermal under-layer"
}

main();

function main() {
  $('#btnCoords').click(function() {
    getLocation()});
    // Create the search box and link it to the UI element.
    //var input = document.getElementById('pac-input');
    //var searchBox = new google.maps.places.SearchBox(input);
    //var autocomplete = new google.maps.places.Autocomplete(input);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
}

//
// API Request Functions
//
function getLocation() {
  /*if (checkCookie('location')) {
    getForcast(getCookie('location'));
  } */
  if (navigator.geolocation) {
    $('#pCoords').html('Geting Position...');
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}
function showPosition(position) {
  $('#pCoords').html('Getting Weather Data...');
  getWeatherPoint(position.coords.latitude, position.coords.longitude);
}
function getWeatherPoint(lat, long) {
  let apiPointsAddress = 'https://api.weather.gov/points/' + lat + ',' + long
  //console.log(apiPointsAddress);
  let request = new XMLHttpRequest();
  console.log('getweatherpoints working');
  request.open('GET', apiPointsAddress, true);
  request.onload = function () {
    console.log('request working');
    let pointData = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400) {
      //console.log(pointData.properties.forecast);
      setCookie('location', pointData.properties.forecast, 1);
      $('#pCoords').html('Geting Forecast...');
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
      console.log(forecastData.properties.periods);
      //setCookie('forecast', JSON.stringify(forecastData.properties.periods), 0.125);
      //global variable forecast
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
    for(var i = 0; i <ca.length; i++) {
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
        console.log('true');
    } else {
        // Cookie ddoes not exist
        return false;
        console.log('false');
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
    for (i = 0; i < fLen; i++) {
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
      //let startTime = hourFormat(new Date(forecastData[i].startTime));
      //console.log((new Date(forecastData[i].startTime)).getDay());
      //let endTime = hourFormat(new Date(forecastData[i].endTime));

      // append info to box
      /*
      + forecastData[i].shortForecast + `, with a temperature of `
      + forecastData[i].temperature + forecastData[i].temperatureUnit
      + ` (` + tempQualifier(forecastData[i].temperature) + `, `
      + `you should wear ` + dressRecs[tempQualifier(forecastData[i].temperature)]
      + `)` + */
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
  let avgTemp = 0;
  let total = 0;
  for (var i = 0; i < tempList.length; i++) {
    total += tempList[i];
  }
  avgTemp = Math.round(total/tempList.length);
  $('#dashboard .panel-text').last().html(
    `The temperature will be ` + avgTemp + `<br>` +
    `The forecast contains ` + JSON.stringify(forecastList) + `<br>`
  );
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
  console.log(qualifier);
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
  console.log(qualifier);
  return(qualifier);
}
function dayQualifier(dateI) {
  let qualifier = ""
  let day0 = (new Date()).getDay();
  let day1 = dateI.getDay();
  if (day0 == day1) {
    //Same day0
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
