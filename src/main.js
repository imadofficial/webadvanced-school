// main.js
import Router from './router.js';
import './style.css';
import './switch.css';

const home = async (container) => {
  let flightsHTML = '';
  try {
      const data = await fetch('./Departures.json');
      const stations = await data.json();

      const flights = stations._embedded.flights;
      
      for (let index = 0; index < flights.length; index++) {
          const flight = flights[index];
          const date = new Date(flight.scheduled_time);

          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const timeStr = `${hours}:${minutes}`;

          flightsHTML += `
          <div class="flight">
              <div class="flighttime" onclick="window.location.hash='/detail?id=${flight["id"]}'">
                  <h5>${timeStr}</h5>
              </div>
              
              <div class="flight-details">
                  <h2>${flight["location"]["name"]}</h2>
                  <p>${flight["companions"][0]["id"]}</p>
              </div>
          </div>
          `;  
      }
  } catch(err) {
      console.log(err);
      flightsHTML = '<p>Error loading flights</p>';
  }

  container.innerHTML = `
  <nav class="navbar">
  <center>
      <div id="switchSelect" class="flight">
          <h2>Vertrekkingen</h2>
          <label class="switch">
              <input type="checkbox" id="flightToggle">
              <span class="slider round"></span>
          </label>
          <h2>Aankomsten</h2>
      </div>
  </center>
  </nav>

  <div>
      <h2 id="Title">Vertrekkingen vanuit Brussels Airport</h2>
      <div class="flights-list">
          ${flightsHTML}
      </div>
  </div>
  `;
  
  // Add toggle functionality
  const toggle = document.getElementById('flightToggle');
  if (toggle) {
      toggle.addEventListener('change', (e) => {
          const title = document.getElementById('Title');
          if (title) {
              title.textContent = e.target.checked 
                  ? 'Aankomsten op Brussels Airport' 
                  : 'Vertrekkingen vanuit Brussels Airport';
          }
      });
  }
};

const notFound = (container) => {
  container.innerHTML = `
  <h1>Page Not Found</h1>
  <a href="/">Go Home</a>
  `;
};

const flightDetails = (container) => {
  container.innerHTML = `
  <div>
      <h1>Flight Details</h1>
      <p>Flight information would appear here</p>
  </div>
  `;
};

// Initialize router
document.addEventListener('DOMContentLoaded', () => {
  const router = new Router({
      '/': home,
      '/detail': flightDetails,
      '404': notFound
  });
});