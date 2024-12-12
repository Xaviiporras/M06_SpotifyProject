import { clientID, clientSecret } from "../env/client.js";

const btnBuscar = document.querySelector("button")

const getSpotifyAccessToken = function (clientId, clientSecret) {
    // Url de l'endpont de spotify
    const url = "https://accounts.spotify.com/api/token";
    // ClientId i ClienSecret generat en la plataforma de spotify
    const credentials = btoa(`${clientId}:${clientSecret}`);


    //Es crear un header on se li passa les credencials
    const header = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
    };



    fetch(url, {
        method: "POST",
        headers: header,
        body: "grant_type=client_credentials", // Paràmetres del cos de la sol·licitud
    })
        .then((response) => {
            // Controlar si la petició ha anat bé o hi ha alguna error.
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json(); // Retorna la resposta com JSON
        })
        .then((data) => {
            // Al data retorna el token d'accés que necessitarem
            // Haurem d’habilitar els botons “Buscar” i “Borrar”
            tokenAcces = data.access_token;
            btnBuscar.disabled = false;
            console.log(data.access_token)
        })
        .catch((error) => {
            // SI durant el fetch hi ha hagut algun error arribarem aquí.
            console.error("Error a l'obtenir el token:", error);
        });
};
