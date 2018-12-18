var x = document.getElementById('pCoords');
var forecastAddress;
var dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                  'Friday', 'Saturday'];
var timeQualDict = {
  'Night' : {'range' : '10pm - 6am', 'color' : '#F2EFF6'},
  'Morning' : {'range' : '6am - 10am', 'color' : '#FFF9E9'},
  'Day' : {'range' : '10am - 4pm', 'color' : '#E9F6FF'},
  'Afternoon' : {'range' : '4pm - 6pm', 'color' : '#FFF5E9'},
  'Evening' : {'range' : '6pm - 10pm', 'color' : '#F6E9FF'}
}
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
var forecastImages = {
  'day' : {
    'clear' : 'clear_day.svg',
    'sunny' : 'clear_day.svg',
    //'cloudy' : 'cloudy.svg',
    'hail' : 'hail.svg',
    'heavy rain' : 'heavy_rain.svg',
    'mostly cloudy' : 'overcast.svg',
    'cloudy' : 'partly_cloudy_day.svg',
    'rain' : 'rain.svg',
    'scattered showers' : 'scattered_showers_day.svg',
    'snow' : 'snow.svg',
    'thunderstorms' : 'thunderstorms.svg',
    'tornado' : 'tornado.svg',
    'hurricane' : 'hurricane.svg',
    'tropical storm' : 'tropical_storm.svg',
    'windy' : 'windy.svg'
  },
  'night' : {
    'clear' : 'clear_night.svg',
    //'cloudy' : 'cloudy.svg',
    'hail' : 'hail.svg',
    'heavy rain' : 'heavy_rain.svg',
    'mostly cloudy' : 'overcast.svg',
    'cloudy' : 'partly_cloudy_night.svg',
    'rain' : 'rain.svg',
    'scattered showers' : 'scattered_showers_night.svg',
    'snow' : 'snow.svg',
    'thunderstorms' : 'thunderstorms.svg',
    'tornado' : 'tornado.svg',
    'hurricane' : 'hurricane.svg',
    'tropical storm' : 'tropical_storm.svg',
  }
};
var flaggedConditions = ['Snow', 'Rain', 'Hail'];

main();

function main() {
  $('#btnCoords').click(function() {
    $(this).button('loading');
    getLocation()
      .then(position => showPosition(position), err => geolocationError(err))
      .then(function(latLong) {
        getCityName(latLong['lat'], latLong['long']);
        return getWeatherPoint(latLong['lat'], latLong['long']);
      })
      .then(function(forecastAddress) {
        forecastAPIAddress = forecastAddress;
        return getForecast(forecastAddress);
      })
      .then(forecastData => forecastDisplay(forecastData))
    $('#updateForecast').css('display', 'initial');
    $('#updateForecast').click(function() {
      getForecast(forecastAPIAddress)
        .then(function(forecastData) {
          $('#dashboard').html('');
          return panelSetup(forecastData)
        })
    })
  });

}
//
// API Request Functions
//
function getLocation() {
  // Get location using HTML5 geolocation API
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      $('#pCoords').html('Geting Position...');
      $('#btnCoords').attr('data-loading-text', '<i class="fa fa-spinner fa-spin"></i> Getting position');
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      $('#loadBtnGroup').html("Geolocation is not supported by this browser.");
    }
  })
}
function geolocationError(error) {
  // Output a readable error in the HTML if one occures when using geoloaction
  $('#loadBtnGroup').html( 'Something went wrong while finding your location:<br>'+ 'ERROR(' + error.code + '): ' + error.message);
}
function showPosition(position) {
  // Pass position data from geolocation API to get forecast from point and
  // city, state info
  $('#pCoords').html('Getting Weather Data...');
  $('#btnCoords').attr('data-loading-text', '<i class="fa fa-spinner fa-spin"></i> Getting weather data');
  return {'lat': position.coords.latitude, 'long': position.coords.longitude};
}
function getWeatherPoint(lat, long) {
  // Use lat and long coords from geolocation to find the station and relative
  // position from NOAA API. Initiate request to get forecast from NOAA API
  return new Promise((resolve, reject) => {
    let apiPointsAddress = 'https://api.weather.gov/points/' + lat + ',' + long
    console.log(apiPointsAddress);
    let request = new XMLHttpRequest();
    console.log('getweatherpoints working');
    request.open('GET', apiPointsAddress, true);
    request.onload = function () {
      console.log('request working');
      //let pointData = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        $('#pCoords').html('Geting Forecast...');
        $('#btnCoords').attr('data-loading-text', '<i class="fa fa-spinner fa-spin"></i> Geting forecast');
        resolve(JSON.parse(request.response).properties.forecast);
      } else {
        reject(function() {
          const errorMessage = document.createElement('marquee');
          errorMessage.textContent = `Unable to reach ` + apiPointsAddress;
          app.appendChild(errorMessage);
        })
      }
    };
    request.send();
  });
}
function getForecast(apiForecastAddress) {
  // Using the station and relative position from NOAA API, query the API for
  // the hourly forecast
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('GET', apiForecastAddress + '/hourly', true);
    console.log(apiForecastAddress + '/hourly')
    request.onload = function () {
      let forecastData = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        //console.log(forecastData.properties.periods);
        resolve(JSON.parse(request.response).properties.periods)
        //forecastDisplay(forecastData.properties.periods);
      } else {
        reject(function() {
          const errorMessage = document.createElement('marquee');
          errorMessage.textContent = `Unable to reach ` + apiForecastAddress;
          app.appendChild(errorMessage);
        })
      }
    }
    request.send();
  })
}
function getCityName(lat, long) {
  // Use lat long coords to get city, state info from FCC API and display it in
  // the navbar
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
function forecastDisplay(forecast) {
  // Fades out the marque, creates HTML for the panels with hourly forecast
  // info, and fades in the HTML

  // Get rid of the marque and bing in the forecat panels
  $('#locationPanel').fadeOut('slow', function(){
    $('#locationPanel').remove();
    $('#main').html(`<div class="panel-group" style="display: none;"
      id="dashboard"></div>`);
      panelSetup(forecast);
      // Once the HTML is created, fade it in
      $('#dashboard').fadeIn(console.log('Fading in...'));
  });
}
function panelSetup(forecast) {
  // Creates all of the panel HTML
  let forecastData = forecast;
  let fLen = 48; //number of hours into the forecast we get
  let forecastList =[];
  let tempList = [];
  // Set up time variables for panels
  let timeList = [];
  let timeQual = timeQualifier(
      (new Date(forecastData[0].startTime)).getHours());
  let lastTimeQual = timeQual;
  // Iterate through hourly forecasts to add info to panels
  for (var i = 0; i < fLen; i++) {
    let time = (new Date(forecastData[i].startTime)).getHours();
    timeQual = timeQualifier(time);
    if (timeQual != lastTimeQual) {
      // i.e. if the new hourly forecast belongs to a new panel, create a
      // panel with the summed up forecast info
      day = dayQualifier(new Date(forecastData[i-1].startTime));
      createPanel(day, lastTimeQual, tempList, forecastList, timeList);
      // Reset the forecast lists
      tempList = [];
      forecastList = [];
      timeList = [];
    };
    // Add forecast info to their respective lists
    forecastList.push(forecastData[i].shortForecast);
    tempList.push(forecastData[i].temperature);
    timeList.push(time);
    // Update the time qual
    lastTimeQual = timeQual;
  };
}
function createPanel(day, timeQual, tempList, forecastList, timeList) {
  // Creates a panel using summed up hourly forecast data

  // For the forecastImages dictionary, determine if we should use a day or
  // night style image
  let imgTime = '';
  if ((timeQual == 'Night') || (timeQual == 'Evening')) {
    imgTime = 'night';
  } else {
    imgTime = 'day';
  };
  // Average out temp data iover the panel/timeQual block
  let avgTemp = 0;
  let total = 0;
  for (var i = 0; i < tempList.length; i++) {
    total += tempList[i];
  };
  avgTemp = Math.round(total/tempList.length);
  // Flag for conditions in the flaggedConditions list
  let conditionFill = flaggedConditionsFill(forecastList, timeList);
  let forecastMode = listMode(forecastList)['value'];
  // Get the correct image dict key for the given forecast
  let forecastImage = "";
  let forecastKeys = Object.keys(forecastImages['day']);
  for (var i = 0; i < forecastKeys.length; i++) {
    if (forecastMode.toLowerCase().includes(forecastKeys[i])) {
      forecastImage = forecastKeys[i];
      break;
    };
  };
  $('#dashboard').append(`
    <div class="panel panel-default ` + day + `">
      <div class="panel-heading" style="background-color:` + timeQualDict[timeQual]['color'] + `;">
        <span>`
          + day + ` ` + timeQual
          + `<em class='pull-right text-muted' id='pnlHeadTime'>`
          + timeQualDict[timeQual]['range'] + `</em>` +
        `</span>
      </div>
      <div class="panel-body">
        <p class="panel-text">
          <div style="padding-left: 20px;" class="row">
            <div class="span4">
              <img style="float:left; padding-right: 15px; margin-top: -15px;"
                  src="resources/icons/` + forecastImages[imgTime][forecastImage]
                  + `" width="100" height="100" class="pnlImg">
              <div class="pnlBodyTxt">
                Temperature: ` + avgTemp + `F`+ `<br>
                Forecast: ` + forecastMode + `<br>` +
                conditionFill + `<br>
              </div>
            </div>
          </div>
          <div style="padding-left: 20px;" class="row pnlRec">
            <br><em>Recommendation: ` + dressRecs[tempQualifier(avgTemp)] + `</em>
          </div>
        </p>
      </div>
    </div>
  `);
}
function fillCityName(cityName, stateName) {
  $('#cityName').html(cityName + ', ' + stateName);
  $('#cityName').click(function() {
    // Update location and forecast
  });
}
//
// Formatting Functions
//
function timeQualifier(hour24) {
  // Determines which block/panel the hourly forecast belongs to
  let qualifier = "";
  if ((hour24 >= 0 && hour24 < 6) || (hour24 >= 22 && hour24 < 24)) {
     qualifier = "Night";
  } else if (hour24 >= 6 && hour24 < 10) {
     qualifier = "Morning";
  } else if (hour24 >= 10 && hour24 < 16) {
     qualifier = "Day";
  } else if (hour24 >= 16 && hour24 < 18) {
     qualifier = "Afternoon";
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
function flaggedConditionsFill(forecastList, timeList) {
  // Outputs a conditon if its flagged (i.e. adverse condition) and in the
  // flaggedConditions list
  let flen = forecastList.length;
  let clen = flaggedConditions.length;
  //console.log('Attempting to flag conditions');
  for (var i=0; i < flen; i++) {
    for (var j=0; j < clen; j++) {
      if (forecastList[i].includes(flaggedConditions[j])) {
        return "There is a chance of " + flaggedConditions[j].toLowerCase() + ` at ` + hourFormat(timeList[j]) + `<br>`;
      }
    }
  }
  return "";
}
function dayQualifier(dateI) {
  // Output a readable day of the week string from ISO date
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
function hourFormat(hour24) {
  // Output a readable string in 12hr time from 24hr time
  let hourAmPm = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  hour12 = hour12 ? hour12 : 12;
  return hour12 + ' ' + hourAmPm;
}
function listMode(inList) {
  // Find the most common sting (mode) of a list
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
