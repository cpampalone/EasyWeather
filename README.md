# EasyWeather
EasyWeather is a web based app that gets weather forecasts for your area and gives recommendations for your day.

### Data Sources
EasyWeather only uses open, free APIs for weather, location, and other data provided by government agencies.
* NOAA's weather API for forecast data
* FCC's census API for reverse geocoding

### Required Features
* Better qualitative forecast display
* Recommendations display
* Forecast based graphics
* Feedback

### Known Issues
* Geolocation services may not work on some browsers without a secure connection. Use Chrome to avoid this issue in development.

### Running EasyWeather
EasyWeather is built on node.js with Express and EJS. It also uses serve-favicon to display a favicon. To run, navigate to the installation folder and run `node app`
