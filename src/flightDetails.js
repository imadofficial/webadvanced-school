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
      <nav class="navbar">
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
        if(data["data"][0]["flight_status"] == "landed"){
            ArrivalBox = `
                <h2>Geland</h2>
                <p title="${dateConvert(data["data"][0]["arrival"]["actual_runway"])}">Om ${dateToTime(data["data"][0]["arrival"]["actual_runway"])}</p>
            `

            DepartureBox = `
                <h2>Vertrokken</h2>
                <p title="${dateConvert(data["data"][0]["departure"]["actual_runway"])}">Om ${dateToTime(data["data"][0]["departure"]["actual_runway"])}</p>
            `
        }else if(data["data"][0]["flight_status"] == "active"){
            ArrivalBox = `
                <h2>In de lucht</h2>
                <p title="${dateConvert(data["data"][0]["arrival"]["estimated_runway"])}">Voor ${dateToTime(data["data"][0]["arrival"]["estimated_runway"])}</p>
            `

            DepartureBox = `
            <h2>Vertrokken</h2>
            <p title="${dateConvert(data["data"][0]["departure"]["actual_runway"])}">Om ${dateToTime(data["data"][0]["departure"]["actual_runway"])}</p>
            `
        }else if(data["data"][0]["flight_status"] == "scheduled"){
            ArrivalBox = `
            <h2>Gepland</h2>
            <p title="${dateConvert(data["data"][0]["arrival"]["estimated"])}">Voor ${dateToTime(data["data"][0]["arrival"]["estimated"])}</p>
            `

            DepartureBox = `
            <h2>Nog in Airport</h2>
            <p title="${dateConvert(data["data"][0]["departure"]["estimated"])}">Gepland voor ${dateToTime(data["data"][0]["departure"]["estimated"])}</p>
            `
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
        <div class="flights-list"></div>
      </div>
      <div>
        <h1 class="Title">Vlucht Details</h1>
        <div class="quickView-container">
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
        <p>Mogelijk door Raven.</p>
      </div>
    `;
  };