// id 6247141433f742069af737fa75514817
// se 0b46b8949b8643e5837d84f486e266cc

var client_id = '';
var client_secret = '';
var redirect_uri = 'http://127.0.0.1:5500/index.html';

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const RECOMMENDATION = 'https://api.spotify.com/v1/recommendations';

function onPageLoad() {
    client_id = localStorage.getItem("client_id");
    client_secret = localStorage.getItem("client_secret");
    if (window.location.search.length > 0) {
        handleRedirect();
    }
    else{
        access_token = localStorage.getItem("access_token");
        if ( access_token != null ){
            refreshRecommendation();
        }
    }
}

function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri);
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code');
    }
    return code;
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function requestAuthorization(){    // Temporary
    localStorage.setItem("client_id", '6247141433f742069af737fa75514817');
    localStorage.setItem("client_secret", '0b46b8949b8643e5837d84f486e266cc'); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    window.location.href = url;
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}


// API call
function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}


// Recommendations
function refreshRecommendation(){
    callApi( "GET", RECOMMENDATION, null, handleRecommendationResponse );
}

function handleRecommendationResponse () {
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}