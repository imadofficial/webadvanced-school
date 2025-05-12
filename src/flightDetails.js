import { GetAirline } from './main.js';
import './infoFlight.css'
import './style.css';

function dateConvert(string){
    const date = new Date(string);
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} om ${date.getHours()}:${date.getMinutes()}`
}

function dateToTime(string){
    const date = new Date(string);
    return `${date.getHours()}:${date.getMinutes()}`
}

export const flightDetails = async (container, queryParams) => {
    const flightId = queryParams.id;
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
        const file = './AirlineInfo.json';
        const response = await fetch(file);
        const data = await response.json();
        return data;$
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
                ArrivalBox = `
                    <h2>In de lucht</h2>
                    <p title="${dateConvert(arrival["estimated_runway"])}">Voor ${dateToTime(arrival["estimated_runway"])}</p>
                `;
                DepartureBox = `
                    <h2>Vertrokken</h2>
                    <p title="${dateConvert(departure["actual_runway"])}">Om ${dateToTime(departure["actual_runway"])}</p>
                `;
                break;

            case "scheduled":
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
            <p>API is mogelijk down</p>
        `

        DepartureBox = `
            <h2>Kan niet verbinden</h2>
            <p>API is mogelijk down</p>            
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
                <p>NouvelAir</p>
            </div>

            <div class="vl extendedData"></div>

            <div class="extendedData FlightBox">
                <h2>Terminal</h2>
                <p>1</p>
            </div>
        </div>
    </div>
    <p>Mogelijk door Raven.</p>
    `;
  };