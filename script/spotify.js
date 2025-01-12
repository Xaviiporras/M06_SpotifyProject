import { clientID, clientSecret } from "../env/client.js";

const btnBuscar = document.querySelector("#search_button");
const inputTrack = document.querySelector("#search_input");
const divCanciones = document.querySelector("#div_canciones");
const divArtista = document.querySelector("#div_artista");
let tokenAcces;

// Botón "Borrar"
document.querySelector(".borrar").addEventListener("click", () => {
    inputTrack.value = "";
    divCanciones.innerHTML = "";
    divArtista.innerHTML = `
        <h2>Informació de l'artista</h2>
        <div>
            <p></p>
            <p></p>
            <p></p>
        </div>`;
    divCanciones.classList.add("hidden");
    divArtista.classList.add("hidden");
});

// Renderizar canciones
const rederitzarTracks = function (infTrack) {
    divCanciones.innerHTML = "";
    divCanciones.classList.remove("hidden");

    for (let i = 0; i < infTrack.length; i++) {
        const objDiv = document.createElement("div");
        objDiv.className = "track";
        objDiv.innerHTML = `
            <img src="${infTrack[i].album.images[0]?.url}" alt="${infTrack[i].name}">
            <h3>${infTrack[i].name}</h3>
            <p><strong>${infTrack[i].artists[0].name}</p>
            <p><strong>${infTrack[i].album.name}</p>
        `;
        objDiv.addEventListener("click", () => {
            const artistId = infTrack[i].artists[0].id;
            updateArtistInfo(artistId);
        });
        divCanciones.appendChild(objDiv);
    }
};

// Obtener información del artista
const updateArtistInfo = function (artistId) {
    const artistUrl = `https://api.spotify.com/v1/artists/${artistId}`;
    const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;

    fetch(artistUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenAcces}`,
        },
    })
        .then((response) => response.json())
        .then((artistData) => {
            fetch(topTracksUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${tokenAcces}`,
                },
            })
                .then((response) => response.json())
                .then((tracksData) => {
                    renderArtistInfo(artistData, tracksData.tracks);
                });
        });
};

// Renderizar información del artista
const renderArtistInfo = (artistData, topTracks) => {
    divArtista.classList.remove("hidden");
    divArtista.innerHTML = `
        <h2>Informació de l'artista</h2>
        <img src="${artistData.images[0]?.url}" alt="${artistData.name}">
        <h3>${artistData.name}</h3>
        <p>Popularitat: ${artistData.popularity}</p>
        <p>Gèneres: ${artistData.genres.join(", ")}</p>
        <p>Seguidors: ${artistData.followers.total.toLocaleString()}</p>
        <h4>Llista cançons més escoltades:</h4>
        <ul>
            ${topTracks.slice(0, 3).map((track) => `<li>${track.name}</li>`).join("")}
        </ul>
    `;
};

// Función de búsqueda
const search = function () {
    const value = inputTrack.value.trim();
    if (value === "") {
        alert("Por favor, escribe algo para buscar.");
        return;
    }

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(value)}&type=track&limit=12`;

    fetch(searchUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenAcces}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.tracks.items.length > 0) {
                rederitzarTracks(data.tracks.items);
            } else {
                divCanciones.classList.add("hidden");
                alert("No se encontraron resultados.");
            }
        });
};

// Obtener token
const getSpotifyAccessToken = function () {
    const url = "https://accounts.spotify.com/api/token";
    const credentials = btoa(`${clientID}:${clientSecret}`);

    fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    })
        .then((response) => response.json())
        .then((data) => {
            tokenAcces = data.access_token;
            btnBuscar.disabled = false;
        });
};

btnBuscar.addEventListener("click", search);
getSpotifyAccessToken();
