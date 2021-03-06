let client_id = '6247141433f742069af737fa75514817';
let client_secret = '0b46b8949b8643e5837d84f486e266cc';
let redirect_uri = 'http://127.0.0.1:5500/index.html';

let access_token = '';
let refresh_token = 'AQA2vs06DOpXDAXvxX1f1Ax3WupRvNOLYVMQSCMvtDaAfc4lPkjuHV3Ey5Fz9Fj9De-V4Zdtz_tJt4LhuTP01BhloGuaJ4xxlNxvM2L6T5VMZ5AOTC1d5BfCGLK4dg1ZSTI';

const TOKEN = "https://accounts.spotify.com/api/token";
const RECOMMENDATION = 'https://api.spotify.com/v1/recommendations';
const GENRES = 'https://api.spotify.com/v1/recommendations/available-genre-seeds';
const FEATURES = 'https://api.spotify.com/v1/audio-features/';

let search_arr;
let tracks_arr;
let features_arr;
let features_chart;

function onPageLoad() {
    refreshAccessToken();
}

function refreshAccessToken() {
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}


/*
    Call for authorization api
*/
function callAuthorizationApi(body) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}
function handleAuthorizationResponse() {
    if ( this.status == 200 ) {
        let data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ) {
            access_token = data.access_token;
        }
        if ( data.refresh_token  != undefined ) {
            refresh_token = data.refresh_token;
        }
        requestGenres();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}


/*
    API calls
*/
function callApi(method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}
// Genres
function requestGenres() {
    if ( access_token != null ) {
        callApi("GET", GENRES, null, handleGenresResponse );
    } else {
        alert('Authorization needed');
    }
}
function handleGenresResponse() {
    if ( this.status == 200 ) {
        handleSearch(JSON.parse(this.responseText));
    } else if ( this.status == 401 ) {
        refreshAccessToken()
    } else {
        console.log(this.responseText);
    }
}

// Recommendations
function requestRecommendations(genre) {
    if ( access_token != null && genre != null) {
        callApi("GET", RECOMMENDATION  + "?limit=5&min_popularity=10&seed_genres=" + genre, null, handleRecommendationsResponse );
    } else {
        alert('Authorization needed');
    }
}
function handleRecommendationsResponse() {
    if ( this.status == 200 ) {
        handleTracks(JSON.parse(this.responseText));
    } else if ( this.status == 401 ) {
        refreshAccessToken()
    } else {
        console.log(this.responseText);
    }
}

// Features
function requestFeatures(track_id) {
    if ( access_token != null ) {
        callApi("GET", FEATURES + track_id, null, handleFeaturesResponse );
    } else {
        alert('Authorization needed');
    }
}
function handleFeaturesResponse() {
    if ( this.status == 200 ) {
        handleFeatures(JSON.parse(this.responseText));
    } else if ( this.status == 401 ) {
        refreshAccessToken()
    } else {
        console.log(this.responseText);
    }
}



/*
    Genres search
*/
function handleSearch(search) {
    search_arr = search.genres.slice();
}

function placeSearch() {
    let input = document.getElementById('searchGenres');
    let filter = input.value.toUpperCase();
    let search_counter = 0;
    let body = '';

    for (i = 0; i < search_arr.length; i++) {
        let search = search_arr[i];
        if (search.toUpperCase().startsWith(filter) && search_counter < 3) {
            search_counter += 1;
            body += '<li id="searchLI' + search_counter +'" class="o-searchLI">'
                    +'<a class="o-searchA" id="searchA'
                    + search_counter +'" href="#" onclick="selectSearchLI(' 
                    + search_counter +')">' 
                    + search +'</a></li>';
        }
    }
    document.getElementById('resultsUL').innerHTML = body;
    document.getElementById('resultsH3').innerText = "Genres";
    if (features_chart != null) {
        features_chart.destroy();
    }
}

function selectSearchLI(search_counter) {
    let search = document.getElementById('searchA' + search_counter).innerHTML;
    document.getElementById('searchGenres').value = search;
    requestRecommendations(search);
}


/*
    Handle tracks
*/
function handleTracks(tracks) {
    tracks_arr = tracks.tracks.slice();
    placeTracks();
}

function placeTracks() {
    let track_counter = 0; 
    let body = '';
    for (i = 0; i < tracks_arr.length; i++) {
        var track = tracks_arr[i];
        body += '<li id="trackLI' + track_counter +'" class="o-trackLI">'
                    +'<a class="o-trackA" id="trackA'+ track_counter +'" href="#" '
                    +'onclick="selectTrackLI('+ track_counter +')">'
                    +'<h3 class="o-resultH3">'+ track.name +'</h3>'
                    +'<h5 class="o-resultH5">'+ track.artists[0].name +'</h5>'
                    +'<h4 class="o-resultH4">'+ Math.round(track.duration_ms / 1000) +'s</h4></a></li>';
        track_counter += 1;
    }
    document.getElementById('resultsUL').innerHTML = body;
    document.getElementById('resultsH3').innerText = "Tracks";
    if (features_chart != null) {
        features_chart.destroy();
    }
}

function selectTrackLI(track_counter) {
    for (i = 0; i < tracks_arr.length; i++) {
        document.getElementById('trackLI' + i).style.border = "none";
    }
    document.getElementById('trackLI' + track_counter).style.border = "1px var(--global-color-charlie) solid";
    document.getElementById('trackLI' + track_counter).style.borderRadius = "8px";
    requestFeatures(tracks_arr[track_counter].id);
}




/*
    Handle features
*/
function handleFeatures(features) {
    features_arr = features;
    placeFeatures();
}

function placeFeatures() {
    let chart = document.getElementById('featureChart').getContext('2d');
    if (features_chart != null) {
        features_chart.destroy();
    }
    features_chart = new Chart(chart, {
        type:'bar',
        data:{
            labels:['acousticness', 'danceability', 'energy', 'valence'],
            datasets:[{
                data:[features_arr.acousticness, 
                      features_arr.danceability,
                      features_arr.energy,
                      features_arr.valence],
                backgroundColor:['#00b330','#009e2b','#008a25','#007520']
            }]
        },
        options:{
            plugins: {
                legend: {
                  display: false
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}