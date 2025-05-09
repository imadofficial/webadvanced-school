import Router from './router.js'
import './style.css'
import './switch.css'

const home = async (container) => {
  let Flights = []
  let flightsHTML = '';
    try{
      const data = await fetch(`./example.json`)
      const stations = await data.json();

      for (let index = 0; index <= 60; index++) {
        const inputString = stations["_embedded"]["flights"][index]["scheduled_time"];

        const date = new Date(inputString);

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        flightsHTML += `
        <div class="flight">
          <div class="flighttime">
            <h5>${timeStr}</h5>
          </div>
          
          <div class="flight-details">
            <h2>${stations["_embedded"]["flights"][index]["location"]["name"]}</h2>
            <p>${stations["_embedded"]["flights"][index]["companions"][0]["id"]}</p>
          </div>
        </div>
      `;  
      }
    }catch(err){
      console.log(err)
    }

    container.innerHTML = `
    <nav class="navbar">
    <center>
        <div id="switchSelect" class="flight">
          <h2>Vertrekkingen</h2>
          <label class="switch">
            <input type="checkbox">
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
};

const notFound = (container) => {
  container.innerHTML = `
  <h1>Fock you</h1>
  `;
}
const router = new Router({
  '/': home,
  '404': notFound
})
