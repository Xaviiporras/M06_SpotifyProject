import { clientID, clientSecret } from "../env/client.js";

const btnBuscar = document.querySelector("#search_button");
const inputTrack = document.querySelector("#search_input");
const divCanciones = document.querySelector("#div_canciones");
const divArtista = document.querySelector("#div_artista");
const loadMoreBtn = document.querySelector("#load_more");
let tokenAcces;
let offset = 0;
let totalTracks = 0;

// Botón "Borrar"
document.querySelector(".borrar").addEventListener("click", () => {
    inputTrack.value = "";
    divCanciones.innerHTML = "";
    divArtista.innerHTML = "";
    divCanciones.classList.add("hidden");
    divArtista.classList.add("hidden");
    loadMoreBtn.classList.add("hidden");
    offset = 0;
    totalTracks = 0;
});

// Obtener canciones seleccionadas del localStorage
const getSelectedTracks = () => {
    const storedTracks = localStorage.getItem("selectedTracks");
    return storedTracks ? storedTracks.split(";") : [];
};

// Guardar canciones seleccionadas en localStorage
const saveSelectedTrack = (trackId) => {
    const selectedTracks = getSelectedTracks();

    if (!selectedTracks.includes(trackId)) {
        selectedTracks.push(trackId);
        localStorage.setItem("selectedTracks", selectedTracks.join(";"));
        alert("¡Canción añadida correctamente al localStorage!");
    } else {
        alert("Esta canción ya está en el localStorage.");
    }
};

// Renderizar canciones
const rederitzarTracks = function (infTrack, reset = true) {
    if (reset) {
        divCanciones.innerHTML = "";
    }
    divCanciones.classList.remove("hidden");

    for (let i = 0; i < infTrack.length; i++) {
        const objDiv = document.createElement("div");
        objDiv.className = "track";
        objDiv.innerHTML = `
            <img src="${infTrack[i].album.images[0]?.url}" alt="${infTrack[i].name}">
            <h3>${infTrack[i].name}</h3>
            <p>${infTrack[i].artists[0].name}</p>
            <p>${infTrack[i].album.name}</p>
            <button class="add-track">+ Afegir cançó</button>
        `;
        // Evento para añadir canción al localStorage
        objDiv.querySelector(".add-track").addEventListener("click", () => {
            saveSelectedTrack(infTrack[i].id);
        });

        // Evento para mostrar detalles del artista
        objDiv.addEventListener("click", () => {
            const artistId = infTrack[i].artists[0].id;
            updateArtistInfo(artistId);
        });

        divCanciones.appendChild(objDiv);
    }
};

// Función para cargar más canciones
const loadMoreTracks = function () {
    const value = inputTrack.value.trim();
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(value)}&type=track&limit=12&offset=${offset}`;

    fetch(searchUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenAcces}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.tracks.items.length > 0) {
                rederitzarTracks(data.tracks.items, false);
                offset += 12;
                updateLoadMoreButton();
            }

            if (offset >= totalTracks) {
                loadMoreBtn.classList.add("hidden");
            }
        });
};

// Actualizar texto del botón "Cargar más"
const updateLoadMoreButton = function () {
    loadMoreBtn.textContent = `+ canciones (${offset} de ${totalTracks})`;
};

// Función de búsqueda
const search = function () {
    const value = inputTrack.value.trim();
    if (value === "") {
        alert("Por favor, escribe algo para buscar.");
        return;
    }

    offset = 0;
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(value)}&type=track&limit=12&offset=${offset}`;

    fetch(searchUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenAcces}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.tracks.items.length > 0) {
                totalTracks = data.tracks.total;
                rederitzarTracks(data.tracks.items);
                offset += 12;
                loadMoreBtn.classList.remove("hidden");
                updateLoadMoreButton();
            } else {
                divCanciones.classList.add("hidden");
                alert("No se encontraron resultados.");
            }
        });
};

// Obtener información del artista y las canciones más escuchadas
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

// Renderizar la información del artista
const renderArtistInfo = (artistData, topTracks) => {
    divArtista.classList.remove("hidden");
    divArtista.innerHTML = `
        <h2>Informació de l'artista</h2>
        <img src="${artistData.images[0]?.url}" alt="${artistData.name}" style="width: 100px; border-radius: 50%;">
        <h3>${artistData.name}</h3>
        <p>Popularitat: ${artistData.popularity}</p>
        <p>Gèneres: ${artistData.genres.join(", ")}</p>
        <p>Seguidors: ${artistData.followers.total.toLocaleString()}</p>
        <h4>Llista cançons més escoltades:</h4>
        <ul>
            ${topTracks.slice(0, 3).map(track => `<li>${track.name}</li>`).join("")}
        </ul>
    `;
};

// Obtener token de acceso
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
loadMoreBtn.addEventListener("click", loadMoreTracks);
getSpotifyAccessToken();
