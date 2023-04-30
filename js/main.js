const lolAppApiKey = "RGAPI-bb917871-93b5-47c3-9cff-8c31e3f37572";

let streamStartTime;
let lolPlayerId;
let twitchUsername;
let lolUsername;
let urlParams = new URLSearchParams(window.location.search);

let checkedMatches = [];
let matchesToCheck = [];

let wins = 0;
let loses = 0;
let server = 'eun1';

$(document).ready(function () {
    twitchUsername = urlParams.get('twitch-username');
    lolUsername = urlParams.get('lol-username')
    let lolServer = urlParams.get('lol-server');
    if (lolServer) {
        server = lolServer;
    }
    initData();

    setIntervalImmediately(() => {
        if (!twitchUsername) {
            console.log('No twitch username')
            return;
        }
        if (!lolUsername) {
            console.log('No Lol username')
            return;
        }



        console.log('Get Played Matches');
        $.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${lolPlayerId}/ids?start=0&count=100&startTime=${streamStartTime}&api_key=${lolAppApiKey}`, (resp) => {
            resp.forEach(el => {
                if(!checkedMatches.includes(el)) {
                    if (!matchesToCheck.includes(el)) {
                        matchesToCheck.push(el);
                    }
                }
            });
        });


        if (matchesToCheck.length > 0) {
            let matchId = matchesToCheck.pop();
            console.log('Checking match ' + matchId);
            checkedMatches.push(matchId);
            $.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${lolAppApiKey}`, resp => {
                if (resp.info.participants.find(el => el.puuid === lolPlayerId).win) {
                    wins++;
                } else {
                    loses++
                }
                console.log('match check finished');
            });
        }

        $('#ww').html(wins);
        $('#ll').html(loses)

    }, 5000);
});

function initData() {
    getStreamStartTime();
    getLolPlayerIdByUsername()
}

function getStreamStartTime() {
    const twitchData = {
        client_id: "vg4eshmtolk98f88dw4kbcepao4kv2",
        client_secret: "t5ikbha6k0enyirc2zmw0clkenpucc",
        grant_type: "client_credentials"
    };
    $.post('https://id.twitch.tv/oauth2/token', twitchData, function (resp) {
        let accessToken = resp['access_token'];

        $.ajax({
            url: 'https://api.twitch.tv/helix/streams?user_login=' + twitchUsername,
            type: 'GET',
            dataType: 'json',
            headers: {
                'Client-Id': 'vg4eshmtolk98f88dw4kbcepao4kv2',
                'Authorization': 'Bearer ' + accessToken
            },
            success: function (result) {
                let data = result['data'];
                if (data.length > 0) {
                    let streamData = data[0];
                    let lastStreamStartTime = Date.parse(streamData['started_at']) / 1000;
                    if (streamStartTime !== lastStreamStartTime) {
                        console.log("setting new start time")
                        streamStartTime = lastStreamStartTime;
                        wins = 0;
                        loses = 0;
                        matchesToCheck = [];
                        checkedMatches = [];
                    }
                }
            },
            error: function (error) {
                console.log(error)
            }
        });
    });
}

function getLolPlayerIdByUsername() {
    $.get(`https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(lolUsername)}?api_key=${lolAppApiKey}`, (resp) => {
       console.log(resp);
       lolPlayerId = resp['puuid'];
    });
}

function setIntervalImmediately(func, interval) {
    func();
    return setInterval(func, interval);
}


