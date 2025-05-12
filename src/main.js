import Router from './router.js';
import { flightDetails } from './flightDetails.js';
import './style.css';
import './switch.css';

function formatFullDate(dateInput, locale = 'en-US') {
  const date = new Date(dateInput);
  const day = date.getDate();

  const month = date.toLocaleString(locale, { month: 'long' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

let airlineData = null;
let eFuse = 0;

export async function GetAirline(Code) {
  if (eFuse === 0) {
    console.log("Pulling data...");
    const airlineFetch = await fetch("./AirlineIndex.json");
    airlineData = await airlineFetch.json();
    eFuse++;
  }

  const [AirlineCode] = Code.split(" ");
  return airlineData[AirlineCode]
    ? `icons/${airlineData[AirlineCode]["Icon"]}`
    : "Unknown.png";
}

function extractTimeDiff(time1, time2){
  const date1 = new Date(time1);
  const date2 = new Date(time2);
  
  const diffInMs = date2 - date1;
  const diffInMinutes = diffInMs / (1000 * 60);
  
  return diffInMinutes  
}

const home = async (container) => {
  let switchSide = localStorage.getItem('switchSide');
  let type = parseInt(switchSide) || 0;
  let allFlights = [];

  const fetchFlights = async () => {
    const file = type === 0 ? './Departures.json' : './Arrivals.json';
    const response = await fetch(file);
    const stations = await response.json();
    allFlights = stations["_embedded"]["flights"];
  };

  const renderFlightList = async (filterText = '') => {
    let flightsHTML = '';
    let OldDate = '';
  
    const filteredFlights = allFlights.filter(flight =>
      flight.location.name.toLowerCase().includes(filterText.toLowerCase())
    );
  
    const airlineCodes = [...new Set(filteredFlights.map(flight =>
      flight.companions[0].id.split(" ")[0] //Brussels Airport heeft altijd een spatie tussen [XX(X)] XXX (IATA Code)
    ))];
  
    const airlineIconMap = {};
    await Promise.all(
      airlineCodes.map(async (code) => {
        const icon = await GetAirline(code).catch(() => 'Unknown.png');
        airlineIconMap[code] = icon;
      })
    );
  
    for (let flight of filteredFlights) {
      const date = new Date(flight.scheduled_time);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      const FlightDate = date.toISOString().split('T')[0];

      let Status
      let timeDiff = extractTimeDiff(flight.scheduled_time,flight.best_known_time)

      if (type == 1){
        Status = `<p>Aangekomen: ${timeDiff} min.</p>`
      }else{
        Status = ""
      }
  
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
        <div class="flight" id="List" onclick="window.location.hash='/detail?id=${flight.companions[0].id}'">
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

          <div class="ExtraDetails mobile-details">
            <p>${flight.companions.length} bedrijven</p>
            ${Status}
          </div>

          <div class="flighttime mobile-details">
            <h3>Details ></h3>
          </div>
        </div>`;
    }
  
    document.querySelector('.flights-list').innerHTML = flightsHTML;
  };  

  const updateTitle = () => {
    document.getElementById('Title').textContent = 
      type === 1 ? 'Aankomsten op Brussels Airport' : 'Vertrekkingen vanuit Brussels Airport';
  };

  const renderLayout = () => {
    container.innerHTML = `
      <nav class="navbar">
        <div id="switchSelect" class="flight">
          <h3>Vertrekkingen</h3>
          <label class="switch">
            <input type="checkbox" id="flightToggle" ${type === 1 ? 'checked' : ''}>
            <span class="slider round"></span>
          </label>
          <h3>Aankomsten</h3>
        </div>
        <input class="citySearch" type="text" placeholder="Stad" id="fname" name="fname">
      </nav>

      <div>
        <h2 id="Title">${type === 1 ? 'Aankomsten op Brussels Airport' : 'Vertrekkingen vanuit Brussels Airport'}</h2>
        <div class="flights-list"></div>
      </div>
    `;

    document.getElementById('flightToggle').addEventListener('change', async (e) => { //Eens de switch geflickt is, voert hij dit functie uit
      type = e.target.checked ? 1 : 0;
      localStorage.setItem('switchSide', `${type}`);
      
      updateTitle();
      
      await fetchFlights();
      renderFlightList();
    });
    
    document.getElementById('fname').addEventListener('input', (e) => {
      renderFlightList(e.target.value); //Zoek functie met filter
    });
  };

  renderLayout(); //Dit functie is "het skelet". Aka, de bare minimum
  
  document.getElementById('flightToggle').checked = type === 1;
  
  await fetchFlights();
  renderFlightList();
};

const notFound = (container) => {
  container.innerHTML = `
  <h1>Page Not Found</h1>
  <a href="/">Go Home</a>
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