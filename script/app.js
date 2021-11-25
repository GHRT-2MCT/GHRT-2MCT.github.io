var client_id = '6247141433f742069af737fa75514817';
var client_secret = '0b46b8949b8643e5837d84f486e266cc';
var redirect_uri = 'http://127.0.0.1:5500/index.html';

var access_token = '';
var refresh_token = 'AQA2vs06DOpXDAXvxX1f1Ax3WupRvNOLYVMQSCMvtDaAfc4lPkjuHV3Ey5Fz9Fj9De-V4Zdtz_tJt4LhuTP01BhloGuaJ4xxlNxvM2L6T5VMZ5AOTC1d5BfCGLK4dg1ZSTI';

const TOKEN = "https://accounts.spotify.com/api/token";
const RECOMMENDATION = 'https://api.spotify.com/v1/recommendations';
const GENRES = 'https://api.spotify.com/v1/recommendations/available-genre-seeds';

var genres_arr;

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
        var data = JSON.parse(this.responseText);
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
        callApi( "GET", GENRES, null, handleGenresResponse );
    } else {
        alert('Authorization needed');
    }
}
function handleGenresResponse() {
    if ( this.status == 200 ) {
        var genres = JSON.parse(this.responseText);
        placeSearchGenres(genres);
    } else if ( this.status == 401 ) {
        refreshAccessToken()
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

// Recommendations
function requestRecommendation(genre) {
    if ( access_token != null && genre != null) {
        callApi( "GET", RECOMMENDATION  + "?limit=1&seed_genres=" + genre, null, handleRecommendationResponse );
    } else {
        alert('Authorization needed');
    }
}
function handleRecommendationResponse() {
    if ( this.status == 200 ) {
        var recommendation = JSON.parse(this.responseText);
        console.log(recommendation);
    } else if ( this.status == 401 ) {
        refreshAccessToken()
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}


/*
    Genres search
*/
function placeSearchGenres(genres) {
    genres_arr = genres.genres.slice();
}

function searchGenres() {
    var input = document.getElementById('searchGenres');
    var filter = input.value.toUpperCase();
    var genre_counter = 0;
    html = '';

    for (i = 0; i < genres_arr.length; i++) {
        var genre = genres_arr[i];
        if (genre.toUpperCase().startsWith(filter) && genre_counter < 3) {
            genre_counter += 1;
            html += '<li id="searchLI'+ genre_counter 
                    +'" class="searchLI" href="#" onclick="searchLI('
                    + genre_counter +')">' 
                    + genre +'</li>';
        }
    }
    document.getElementById('searchUL').innerHTML = html;
}

function searchLI(number) {
    var genre = document.getElementById('searchLI' + number).innerHTML;
    console.log(genre);
    requestRecommendation(genre);
}