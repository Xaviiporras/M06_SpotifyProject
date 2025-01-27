const API_URL_SEVERAL_TRACKS = "https://api.spotify.com/v1/tracks";
const accesToken = window.location.href.split("access_token=")[1];
let idUser = "";

console.log(accesToken)

const renderTracks = function (tracks) {

}

const getPlaylistByUser = async function () {
    const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
}

const getPlaylist = function () {
    getUser().then(function(){
        getPlaylistByUser
    });
    
}

const getIdTracksLocalStorage = function () {
    return localStorage.getItem("selectedTracks")
}

const getTrack = async function (llistaTracks) {
    try {
        const urlEndpoint = `${API_URL_SEVERAL_TRACKS}?ids=${llistaTracks}`
        const resposta = await fetch(urlEndpoint,
            {
                "method": "GET",
                "headers": {
                    "Authorization": `Bearer ${accesToken}`
                }
            }

        )
        renderTracks(resposta);

        if (!resposta.ok) {
            throw Error("Error al fer la consulta ", resposta.status)
        }

        const tracks = await resposta.json();
        console.log(tracks)
    }
    catch (error) {
        console.log(error)
    }
}


const getTrackSelected = function () {
    let tracklist = getIdTracksLocalStorage()
    getTrack(tracklist)

}


const getUser = async function () {
    const url = "https://api.spotify.com/v1/me";


    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });


        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }


        const data = await response.json();


        if (data) {
            idUser = data.id;
        } else {
            console.log("No hi ha usuari");
        }
    } catch (error) {
        console.error("Error en obtenir l'usuari:", error);
    }
};

