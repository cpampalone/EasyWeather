# EasyWeather
EasyWeather is a web based app that gets weather forecasts for your area and gives recommendations for your day.

### Data Sources
EasyWeather only uses open, free APIs for weather, location, and other data.
* NOAA's weather API for forecast data
* FCC's census API for reverse geocoding
* open-iconic for the favicon

### Planned Features
* Better qualitative forecast display
* Recommendations display
* Forecast based graphics
* Feedback

### Known Issues
* Geolocation services may not work on some browsers without a secure connection. Use Chrome to avoid this issue in development.

### Running EasyWeather
EasyWeather is built on Node.js with Express and EJS. To run, navigate to the installation folder and run `node app`

### Packages and Dependancies
There is no need to install these as they are included in the EasyWeather package or pulled from online databases.
* EJS (for rendering pages)
* Express
* serve-favicon (to display a favicon)
* jQuery 3.3.1 (from Google)
* Font Awesome 4.7.0 (from Cloudflare)
* Bootstrap 3.3.7 JS and CSS (from Bootstrapcdn)
* Icons are provided by 'icon lauk' under the (Creative Commons Attribution 3.0 Unported)[https://creativecommons.org/licenses/by/3.0/] license. Some icons are edited
