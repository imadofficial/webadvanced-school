// main.js
import Router from './router.js';
import './style.css';
import './switch.css';

function formatFullDate(dateInput, locale = 'en-US') {
  const date = new Date(dateInput); // Convert the input to a Date object
  const day = date.getDate();

  const month = date.toLocaleString(locale, { month: 'long' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

const home = async (container) => {
  let type = 0; // 0 = Departures, 1 = Arrivals

  const renderFlights = async () => {
      let flightsHTML = '';
      try {
          const file = type === 0 ? './Departures.json' : './Arrivals.json';
          const response = await fetch(file);
          const stations = await response.json();
          const flights = stations._embedded.flights;


          const getTodayUTC = () => new Date().toISOString().slice(0, 10);

          let OldDate = getTodayUTC();
          
          for (let flight of flights) {
              const date = new Date(flight.scheduled_time);
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const timeStr = `${hours}:${minutes}`;


              let FlightDate = date.toISOString().split('T')[0];

              if(FlightDate != OldDate){
                flightsHTML += `
                <div class="HStackLeft">
                  <h3>${formatFullDate(FlightDate, "en-US")}</h3>
                <hr>
              </div>`
              }

              OldDate = FlightDate

              flightsHTML += `
              <div class="flight" onclick="window.location.hash='/detail?id=${flight.id}'">
                  <div class="flighttime">
                      <h5>${timeStr}</h5>
                  </div>
                  <div class="flight-details">
                      <h2>${flight.location.name}</h2>
                      <p>${flight.companions[0].id}</p>
                  </div>
              </div>
              `;
          }
      } catch (err) {
          console.error(err);
          flightsHTML = '<p>Error loading flights</p>';
      }

      container.innerHTML = `
      <nav class="navbar">
        <div id="switchSelect" class="flight">
          <h2>Vertrekkingen</h2>
          <label class="switch">
            <input type="checkbox" id="flightToggle" ${type === 1 ? 'checked' : ''}>
            <span class="slider round"></span>
          </label>
          <h2>Aankomsten</h2>
        </div>
        <input type="text" id="fname" name="fname">
      </nav>

      <div>
          <h2 id="Title">${type === 1 ? 'Aankomsten op Brussels Airport' : 'Vertrekkingen vanuit Brussels Airport'}</h2>
          <div class="flights-list">
              ${flightsHTML}
          </div>
      </div>
      `;

      const toggle = document.getElementById('flightToggle');
      if (toggle) {
          toggle.addEventListener('change', async (e) => {
              type = e.target.checked ? 1 : 0;
              await renderFlights(); // re-render with new type
          });
      }
  };

  await renderFlights();
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