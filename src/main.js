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

let airlineData = null;
let eFuse = 0;

async function GetAirline(Code) {
  if (eFuse === 0) {
    console.log("Pulling data...");
    const airlineFetch = await fetch("./AirlineIndex.json");
    airlineData = await airlineFetch.json();
    eFuse++; // Mark as loaded
  }

  const [AirlineCode] = Code.split(" ");
  return airlineData[AirlineCode]
    ? `icons/${airlineData[AirlineCode]["Icon"]}`
    : "Unknown.png";
}

const home = async (container) => {
  let type = 0;
  let allFlights = [];

  const fetchFlights = async () => {
    const file = type === 0 ? './Departures.json' : './Arrivals.json';
    const response = await fetch(file);
    const stations = await response.json();
    allFlights = stations._embedded.flights;
  };

  const renderFlightList = async (filterText = '') => {
    let flightsHTML = '';
    const getTodayUTC = () => new Date().toISOString().slice(0, 10);
    let OldDate = '';
  
    // 1. Filter flights by search input
    const filteredFlights = allFlights.filter(flight =>
      flight.location.name.toLowerCase().includes(filterText.toLowerCase())
    );
  
    // 2. Extract unique airline codes
    const airlineCodes = [...new Set(filteredFlights.map(flight =>
      flight.companions[0].id.split(" ")[0]
    ))];
  
    // 3. Fetch icon for each unique code only once
    const airlineIconMap = {};
    await Promise.all(
      airlineCodes.map(async (code) => {
        const icon = await GetAirline(code).catch(() => 'Unknown.png');
        airlineIconMap[code] = icon;
      })
    );
  
    // 4. Render flights
    for (let flight of filteredFlights) {
      const date = new Date(flight.scheduled_time);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      const FlightDate = date.toISOString().split('T')[0];
  
      if (FlightDate !== OldDate) {
        flightsHTML += `
          <div class="HStackLeft">
            <h3>${formatFullDate(FlightDate, "en-US")}</h3>
            <hr>
          </div>`;
        OldDate = FlightDate;
      }
  
      const airlineCode = flight.companions[0].id.split(" ")[0];
      const airlineIcon = airlineIconMap[airlineCode] || 'Unknown.png';
  
      flightsHTML += `
        <div class="flight" onclick="window.location.hash='/detail?id=${flight.id}'">
          <div class="flighttime">
            <h5>${timeStr}</h5>
          </div>
          <div class="flighttime">
            <img src="${airlineIcon}" width="40" height="40">
          </div>
          <div class="flight-details">
            <h2>${flight.location.name}</h2>
            <p>${flight.companions[0].id}</p>
          </div>
        </div>`;
    }
  
    document.querySelector('.flights-list').innerHTML = flightsHTML;
  };  

  const renderLayout = () => {
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
        <input type="text" placeholder="Stad" id="fname" name="fname">
      </nav>

      <div>
        <h2 id="Title">${type === 1 ? 'Aankomsten op Brussels Airport' : 'Vertrekkingen vanuit Brussels Airport'}</h2>
        <div class="flights-list"></div>
      </div>
    `;

    document.getElementById('flightToggle').addEventListener('change', async (e) => {
      type = e.target.checked ? 1 : 0;
      await fetchFlights();
      renderFlightList();
    });

    document.getElementById('fname').addEventListener('input', (e) => {
      renderFlightList(e.target.value);
    });
  };

  renderLayout();
  await fetchFlights();
  renderFlightList();
};


const notFound = (container) => {
  container.innerHTML = `
  <h1>Page Not Found</h1>
  <a href="/">Go Home</a>
  `;
};

const flightDetails = (container, queryParams) => {
  const flightId = queryParams.id;

  container.innerHTML = `
      <div>
          <h1>Flight Details</h1>
          <p>Flight ID: ${flightId}</p>
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