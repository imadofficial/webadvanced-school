import Router from './router.js';
import { flightDetails } from './flightDetails.js';
import './style.css';
import './switch.css';

function formatFullDate(dateInput, locale = 'nl-BE') {
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

function dateToTime(string) {
  const date = new Date(string);
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

const home = async (container) => {
  let switchSide = localStorage.getItem('switchSide');
  let type = parseInt(switchSide) || 0;
  let allFlights = [];

  const fetchFlights = async () => {
    const file = type === 0 ? 'http://localhost:3000/getDepartures' : 'http://localhost:3000/getArrivals';
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error('API niet bereikbaar');
      const stations = await response.json();
      allFlights = stations["_embedded"]["flights"];
      return true;
    } catch (error) {
      showApiError();
      return false;
    }
  };

  function showApiError() {
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
      <div style="text-align:center;padding:5em;">
        <h2>Kan geen verbinding maken met de server.</h2>
        <p>Controleer uw internetverbinding en probeer opnieuw.</p>
        <button id="herladen" style="padding:0.5em 1em;font-size:1em;">Opnieuw laden</button>
      </div>
    `;
    document.getElementById('herladen').onclick = () => location.reload();
    document.getElementById('flightToggle').checked = type === 1;
    document.getElementById('flightToggle').addEventListener('change', async (e) => {
      type = e.target.checked ? 1 : 0;
      localStorage.setItem('switchSide', `${type}`);
      location.reload();
    });
  }

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

      const nu = new Date();
      let Status

      const now = new Date()
      const scheduledTime = new Date(flight.scheduled_time);
      const bestKnownTime = new Date(flight.best_known_time);

      const diffMs = now - bestKnownTime;
      const diffMinutes = Math.ceil(diffMs / 1000 / 60);

      if (type == 1){
        if(now > bestKnownTime){
          Status = `<p>Aangekomen (${diffMinutes} min. geleden)</p>`
        }else{
          if(scheduledTime < bestKnownTime){
            Status = `<p>Te laat: ${dateToTime(bestKnownTime)}</p>`
          }else if (scheduledTime > bestKnownTime){
            Status = `<p>Komt vroeg: ${dateToTime(bestKnownTime)}</p>`;
          }else{
            Status = `<p>Gepland voor: ${dateToTime(scheduledTime)}</p>`;
          }
        }
      }else{
        if(now > bestKnownTime){
          Status = `<p>Vertrokken: ${dateToTime(bestKnownTime)}</p>`;
        }else{
          Status = ``;
        }
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

      let bedrijfStr
      if(flight.companions.length == 1){
        bedrijfStr = "bedrijf" 
      }else{
        bedrijfStr = "bedrijven"
      }
  
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
            <p>${flight.companions.length} ${bedrijfStr}</p>
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
  const success = await fetchFlights();
  if (success) {
    renderFlightList();
  }
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