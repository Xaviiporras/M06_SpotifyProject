const API_URL_PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const API_URL_SEVERAL_TRACKS = "https://api.spotify.com/v1/tracks";
const API_URL_ADD_TRACKS = "https://api.spotify.com/v1/playlists";
const API_URL_UPDATE_PLAYLIST = "https://api.spotify.com/v1/playlists";
const accesToken = window.location.href.split("access_token=")[1];
let selectedPlaylistId = "";

const playlistInput = document.querySelector("#new_playlist_name");
const savePlaylistButton = document.querySelector("#save_playlist");

document.querySelector("#back_button").addEventListener("click", () => {
    window.location.href = "index.html"; 
});

const getIdTracksLocalStorage = function () {
    let storedTracks = localStorage.getItem("selectedTracks");
    return storedTracks ? storedTracks.split(",") : [];
};


const renderTracks = function (tracks) {
    const selectedSongsContainer = document.querySelector("#selected_songs_list");
    selectedSongsContainer.innerHTML = "";

    if (!tracks || !tracks.tracks || tracks.tracks.length === 0) {
        selectedSongsContainer.innerHTML = "<p>No hay canciones seleccionadas.</p>";
        return;
    }

    tracks.tracks.forEach((track) => {
        const songDiv = document.createElement("div");
        songDiv.className = "track-item";

        songDiv.innerHTML = `
            <span>${track.name} - ${track.artists.map(artist => artist.name).join(", ")}</span>
            <button class="add-track" data-id="${track.id}">ADD</button>
            <button class="delete-track" data-id="${track.id}">DEL</button>
        `;

        selectedSongsContainer.appendChild(songDiv);
    });

    asignarEventosBotones();
};

const asignarEventosBotones = function () {
    document.querySelectorAll(".delete-track").forEach((button) => {
        button.addEventListener("click", function (e) {
            const trackId = e.target.getAttribute("data-id");
            deleteTrackFromLocalStorage(trackId);
        });
    });

    document.querySelectorAll(".add-track").forEach((button) => {
        button.addEventListener("click", function (e) {
            const trackId = e.target.getAttribute("data-id");
            addTrackToPlaylist(trackId);
        });
    });
};

const deleteTrackFromLocalStorage = function (trackId) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta canción del LocalStorage?")) {
        return;
    }
    let storedTracks = localStorage.getItem("selectedTracks");
    if (!storedTracks) return;

    let trackList = storedTracks.split(",");
    trackList = trackList.filter(id => id !== trackId);

    localStorage.setItem("selectedTracks", trackList.join(","));
    getTrackSelected();
};


const addTrackToPlaylist = async function (trackId) {
    if (!selectedPlaylistId) {
        alert("Por favor, selecciona una playlist antes de añadir la canción.");
        return;
    }
    if (!confirm("¿Estás seguro de que quieres añadir esta canción a la playlist?")) {
        return;
    }
    const url = `${API_URL_ADD_TRACKS}/${selectedPlaylistId}/tracks`;
    const trackUri = `spotify:track:${trackId}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accesToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uris: [trackUri]
            })
        });

        if (!response.ok) throw new Error(`Error al añadir la canción: ${response.status}`);

        alert("Canción añadida correctamente a la playlist.");

        deleteTrackFromLocalStorage(trackId);

        getTracksFromPlaylist(selectedPlaylistId);
    } catch (error) {
        console.error("Error al añadir la canción a la playlist:", error);
    }
};

const getTrackSelected = function () {
    let tracklist = getIdTracksLocalStorage();
    if (tracklist.length > 0) getTrack(tracklist.join(","));
};

const getTrack = async function (llistaTracks) {
    if (!llistaTracks) return;

    try {
        const urlEndpoint = `${API_URL_SEVERAL_TRACKS}?ids=${llistaTracks}`;
        const response = await fetch(urlEndpoint, {
            method: "GET",
            headers: { Authorization: `Bearer ${accesToken}` }
        });

        if (!response.ok) throw new Error(`Error al obtener canciones: ${response.status}`);

        const tracks = await response.json();
        renderTracks(tracks);
    } catch (error) {
        console.error("Error al obtener las canciones:", error);
    }
};

const getUserPlaylists = async function () {
    try {
        const response = await fetch(API_URL_PLAYLISTS, {
            method: "GET",
            headers: { Authorization: `Bearer ${accesToken}` }
        });

        if (!response.ok) throw new Error(`Error al obtener playlists: ${response.status}`);

        const data = await response.json();
        renderUserPlaylists(data.items);
    } catch (error) {
        console.error("Error al obtener playlists:", error);
    }
};

const renderUserPlaylists = function (playlists) {
    const playlistsContainer = document.querySelector("#playlists_list");
    const playlistMessage = document.querySelector("#playlist_message");
    playlistsContainer.innerHTML = "";

    playlists.forEach((playlist) => {
        const playlistItem = document.createElement("li");
        playlistItem.className = "playlist-item";
        playlistItem.innerHTML = `<button class="playlist-button" data-id="${playlist.id}" data-name="${playlist.name}">${playlist.name}</button>`;

        playlistItem.querySelector(".playlist-button").addEventListener("click", (e) => {
            selectedPlaylistId = e.target.getAttribute("data-id"); 
            const playlistName = e.target.getAttribute("data-name"); 
            playlistInput.value = playlistName;

            getTracksFromPlaylist(selectedPlaylistId);
            playlistMessage.style.display = "none";
        });

        playlistsContainer.appendChild(playlistItem);
    });
};

const getTracksFromPlaylist = async function (playlistId) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${accesToken}` }
        });

        if (!response.ok) throw new Error(`Error al obtener canciones de la playlist: ${response.status}`);

        const data = await response.json();
        renderPlaylistTracks(data.items, playlistId);
    } catch (error) {
        console.error("Error al obtener canciones de la playlist:", error);
    }
};

const updatePlaylistName = async function () {
    if (!selectedPlaylistId) {
        alert("Selecciona una playlist antes de cambiar el nombre.");
        return;
    }
    if (!confirm("¿Estás seguro de que quieres cambiar el nombre de la playlist?")) {
        return;
    }
    const newName = playlistInput.value.trim();
    if (newName === "") {
        alert("El nombre de la playlist no puede estar vacío.");
        return;
    }

    const url = `${API_URL_UPDATE_PLAYLIST}/${selectedPlaylistId}`;

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accesToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: newName })
        });

        if (!response.ok) throw new Error(`Error al actualizar la playlist: ${response.status}`);

        alert("Nombre de la playlist actualizado correctamente.");
        getUserPlaylists();
    } catch (error) {
        console.error("Error al actualizar la playlist:", error);
    }
};
savePlaylistButton.addEventListener("click", updatePlaylistName);


const deleteTrackFromPlaylist = async function (playlistId, trackUri) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta canción de la playlist?")) {
        return;
    }
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accesToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tracks: [{ uri: trackUri }]
            })
        });

        if (!response.ok) throw new Error(`Error al eliminar la canción: ${response.status}`);

        console.log(`Canción eliminada de la playlist con ID: ${playlistId}`);

        getTracksFromPlaylist(playlistId);
    } catch (error) {
        console.error("Error al eliminar la canción:", error);
    }
};

const renderPlaylistTracks = function (tracks, playlistId) {
    const tracksContainer = document.querySelector("#songs_list");
    tracksContainer.innerHTML = "";

    if (!tracks || tracks.length === 0) {
        tracksContainer.innerHTML = "<p>Esta playlist no tiene canciones.</p>";
        return;
    }

    tracks.forEach((trackObj) => {
        const track = trackObj.track;
        const trackItem = document.createElement("li");
        trackItem.className = "track-item";

        trackItem.innerHTML = `
            <span>${track.name} - ${track.artists.map(artist => artist.name).join(", ")}</span>
            <button class="delete-from-playlist" data-uri="${track.uri}" data-playlist="${playlistId}">DEL</button>
        `;

        trackItem.querySelector(".delete-from-playlist").addEventListener("click", (e) => {
            const trackUri = e.target.getAttribute("data-uri");
            deleteTrackFromPlaylist(playlistId, trackUri);
        });

        tracksContainer.appendChild(trackItem);
    });
};

getUserPlaylists();
getTrackSelected();
