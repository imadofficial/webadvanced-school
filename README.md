# Welkom bij de vluchttracker!
Met dit webapp kan je eenvoudig je vluchten tracken die vanuit Brussels Airport vertrekken & aankomen.
Ook kan je bijkomende informatie over de vlucht bekijken op een eenvoudig manier.


## Mogelijke probleem
Alhoewel de error handling goed werkt. Wil ik er eventjes erbij wijzen dat als je op http://localhost:5173/#/detail?id=AC%20833 zit en de site niet werkt, is het mogelijk omdat we de ratelimiet bereikt hebben van mijn API. Dit kan je fixen door je eigen API-Sleutel te fixen via https://aviationstack.com/. Deze is gratis en kan je makkelijk in de code steken met de JSON die meegeleverd is met de app (in de src/ directory)
