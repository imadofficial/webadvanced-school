import { GetAirline } from './main.js';
import './infoFlight.css'
import './style.css';

function dateConvert(string){
    const date = new Date(string);
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} om ${date.getHours()}:${date.getMinutes()}`
}

let airlineData = null;
let eFuse = 0;

async function GetAirlineName(Code) {
  if (eFuse === 0) {
    console.log("Pulling data...");
    const airlineFetch = await fetch("./AirlineIndex.json");
    airlineData = await airlineFetch.json();
    eFuse++;
  }

  return airlineData[Code]["name"]
}

function dateToTime(string) {
    const date = new Date(string);
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
}

export const flightDetails = async (container, queryParams) => {
    const flightId = queryParams.id;
    let strFlight = flightId.replace(/\s/g, '');
    let flightCompCode = flightId.split(" ")[0]
    let navbar = `
      <nav class="detailNavbar">
        <h2 id="Navtitle">Info over</h2>
        <img src=${await GetAirline(flightId)} width="50" height="(50)">
        <h2 id="Navtitle">${flightId}</h2>
      </nav>
  `
    container.innerHTML = `
        ${navbar}
    `
    
    const fetchFlight = async () => {
        try{
        console.log(`Pulling data from flight ${strFlight}`)
        const file = `http://localhost:3000/getFlightDetails?flightnr=${strFlight}`;
        const response = await fetch(file);
        console.log(response);
        console.log(`Fetch completed`)
        const data = await response.json();
        console.log(`Parsing...`)
        return data;
    }catch(err){
        console.log(`Failed to fetch: ${err}`)
    }
    };
  
    const data = await fetchFlight();
    console.log(data)

    let ArrivalBox
    let DepartureBox

    try{
        const flightStatus = data["data"][0]["flight_status"];
        const arrival = data["data"][0]["arrival"];
        const departure = data["data"][0]["departure"];

        switch (flightStatus) {
            case "landed":
                ArrivalBox = `
                    <h2>Geland</h2>
                    <p title="${dateConvert(arrival["actual_runway"])}">Om ${dateToTime(arrival["actual_runway"])}</p>
                `;
                DepartureBox = `
                    <h2>Vertrokken</h2>
                    <p title="${dateConvert(departure["actual_runway"])}">Om ${dateToTime(departure["actual_runway"])}</p>
                `;
                break;

            case "active":
                if (arrival["estimated_runway"] != null && arrival["estimated_runway"] !== undefined) {
                    ArrivalBox = `
                        <h2>In de lucht</h2>
                        <p title="${dateConvert(arrival["estimated_runway"])}">Aankomst rond ${dateToTime(arrival["estimated_runway"])}</p>
                    `;
                    DepartureBox = `
                        <h2>Vertrokken</h2>
                        <p title="${dateConvert(departure["actual_runway"])}">Tot ${dateToTime(departure["actual_runway"])}</p>
                    `;
                } else {
                    ArrivalBox = `
                        <h2>In de lucht</h2>
                        <p title="${arrival["estimated_runway"] ? dateConvert(arrival["estimated_runway"]) : 'onbekend'}">Aankomst tijd: ${arrival["estimated_runway"] ? dateToTime(arrival["estimated_runway"]) : 'Onbekend'}</p>
                    `;
                    DepartureBox = `
                        <h2>Vertrokken</h2>
                        <p title="${dateConvert(departure["scheduled"])}">Gepland tot ${dateToTime(departure["scheduled"])}</p>
                    `;
                }
                break;

            case "scheduled":
                ArrivalBox = `
                    <h2>Gepland</h2>
                    <p title="${dateConvert(arrival["scheduled"])}">Om ${dateToTime(arrival["scheduled"])}</p>
                `;
                DepartureBox = `
                    <h2>Nog in Airport</h2>
                    <p title="${dateConvert(departure["estimated"])}">Gepland vertrek om: ${dateToTime(departure["estimated"])}</p>
                `;
                break;

            case "diverted":
                ArrivalBox = `
                    <h2>Gepland</h2>
                    <p title="${dateConvert(arrival["estimated"])}">Voor ${dateToTime(arrival["estimated"])}</p>
                `;
                DepartureBox = `
                    <h2>Nog in Airport</h2>
                    <p title="${dateConvert(departure["estimated"])}">Gepland voor ${dateToTime(departure["estimated"])}</p>
                `;
                break;
        }
    }catch(err){
        ArrivalBox = `
            <h2>Kan niet verbinden</h2>
            <p>API is mogelijk down of vlucht is niet gevonden</p>
        `

        DepartureBox = `
            <h2>Kan niet verbinden</h2>
            <p>API is mogelijk down of vlucht is niet gevonden</p>
        `
    }
  
    container.innerHTML = `
    ${navbar}
    <div>
        <h1 class="Title">Vlucht Details</h1>
        <div>
            <div class="quickView">
                <div class="quickView-item">
                    <div class="boxTitle">
                        <img src="./departed_icon.png" height="30" width="30">
                        <h2>Vertrek</h2>
                    </div>

                    <div class="FlightBox">
                        ${DepartureBox}
                    </div>
                </div>

                <div class="quickView-item">
                    <div class="boxTitle">
                        <img src="./arrival_icon.png" height="30" width="30">
                        <h2>Aankomst</h2>
                    </div>
                    <div class="FlightBox">
                        <div>
                            ${ArrivalBox}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="quickView-item extendedBox">
        <div class="boxTitle">
            <img src="./Unknown.png" height="30" width="30">
            <h2>Type vliegtuig</h2>
        </div>
        <div class="extendedDetails">
            <div class="extendedData FlightBox">
                <h2>Operator</h2>
                <p>${await GetAirlineName(flightCompCode)}</p>
            </div>

            <div class="vl extendedData"></div>

            <div class="extendedData FlightBox">
                <h2>Terminal</h2>
                <p>1</p>
            </div>
        </div>
    </div>
    <p>Mogelijk gemaakt door <a href="https://testflight.apple.com/join/pnftqm1y">Plus.</a></p>
    `;
  };