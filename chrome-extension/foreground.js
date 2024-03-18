(function () {
    'use strict';   

    // url hask #tiktakgames|550e8400-e29b-41d4-a716-446655440000|f005d178-94f8-4091-bf48-0cee83bbf39f gibi olmalı. tag|ACCOUNT_UUID|GAME_UUID
    const urlHash = window.location.hash;
 
    if(!urlHash) return;
    // eğer hash #tiktakgames ile başlamıyorsa return
    if(!urlHash.startsWith("#tiktakgames")) return;
    const hashParts = urlHash.split('|');
    if(hashParts.length < 3) return;
    
    const TAG = hashParts[1];
    const ACCOUNT_UUID = hashParts[2];
    const GAME_UUID = hashParts[3];

    // tarayıcnın userAgent'ini alıyoruz.
    const USER_AGENT = navigator.userAgent;

    class Log { 
        // put here static queue
        static queue = [];
    
        static success(message) {
            Log.createLog(message, 'success');
        }
      
        static error(message) {
            Log.createLog(message, 'error');
        }
      
        static warning(message) {
            Log.createLog(message, 'warning');
        }
      
        static info(message) {
            Log.createLog(message, 'info');
        }
      
        static log(message) {
            Log.createLog(message, 'log');
        }
      
        static heartbeat(message) {
            Log.createLog(message, 'heartbeat');
        } 
    
        static getLogContainer() {
            let logContainer = document.getElementById('tiktak-games-log-container');
            if(!logContainer) {
                const DASHBOARD_HTML = `<div id="tiktak-games-dashboard">
                    <div id="tiktak-games-wrapper"> 
                        <div id="tiktak-games-header">
                            <div>
                                Yayın boyunca bu sayfayı böylece açık tutun. Keep this page open throughout the broadcast. 
                            </div>
                        </div> 
                        <div id="tiktak-games-log-container">
                            <div style="font-size:30px">TikTakGames. Interactive Game Platform</div>
                        </div> 
                    </div> 
                </div>
                <link href="https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap" rel="stylesheet">
                `
                // DASHBOARD_HTML i body e ekle
                let e = document.createElement('div');
                e.innerHTML = DASHBOARD_HTML;
                document.body.appendChild(e);
                logContainer = document.getElementById('tiktak-games-log-container'); 
    
                // logContainerInner özerine mouse geldiğinde ve gittiğinde bir attribute ekleyip çıkartıyoruz.
                logContainer.addEventListener('mouseenter', () => {
                    logContainer.setAttribute('data-hover', 'true');
                });
                logContainer.addEventListener('mouseleave', () => {
                    logContainer.removeAttribute('data-hover');
                }); 
            }
            return logContainer;
        }
        
    
        static createLog(message, type) {
            if(!document.body ){
                Log.queue.push({ message, type });
                return;
            }
            if(Log.queue.length > 0) {
                const queue = Log.queue;
                Log.queue = [];
                queue.forEach(log => {
                    Log.createLog(log.message, log.type);
                });
            }
            const logContainer = Log.getLogContainer();
          
            const logElement = document.createElement('div'); 
            logElement.className = 'log-' + type;
            logElement.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span> <span class="log-message">${message}</span>`; 
        
            if (logContainer.children.length >= 300) {
                logContainer.removeChild(logContainer.children[0]);
            } 
            logContainer.appendChild(logElement);

            if(type == "heartbeat"){
                // 1 saniye sonra "timeout" class'ı ekleyip 1 saniye sonra kaldırıyoruz.
                setTimeout(() => {
                    logElement.classList.add('timeout');
                    setTimeout(() => {
                        logElement.remove();
                    }, 300);
                }, 3000); 
            }
    
            let isHover = logContainer.getAttribute('data-hover') === 'true';
            if(!isHover) logElement.scrollIntoView(); 
        }
    }


    let ROOM_ID = "";
    let USER_ID = "";
    let STREAMER_USERNAME = "";
    let PAGE_INFO = null;
    let PAGE_INFO_DETECTED = false; 
    let LIVE_ENDED = false;

    Log.success("TikTok Live Heartbeat started!"); 
    
    Log.log("Saving native XMLHttpRequest.open, WebSocket and Response.json functions...");
    let _XMLHttpRequestOpen = window.XMLHttpRequest.prototype.open;
    let _WebSocket = window.WebSocket;
    let _ResponseJson = window.Response.prototype.json;
    let _fetch = window.fetch;
    Log.info("Native XMLHttpRequest.open, WebSocket and Response.json functions are saved!");

    // override native functions
    // override XMLHttpRequest.open function
    Log.log("Overriding XMLHttpRequest.open, WebSocket and Response.json functions...");
    window.XMLHttpRequest.prototype.open = function (method, url) {
        if (url && url.includes('/webcast/im/fetch') && url.includes(ROOM_ID) && url.includes('msToken')) {
            this.addEventListener('readystatechange', () => {
                if (this.readyState === 4) {
                    console.log(this.response)
                }
            })
        } 
        return _XMLHttpRequestOpen.apply(this, arguments);
    }
    Log.success("XMLHttpRequest.open function is overridden!");

    // override WebSocket function
    Log.log("Overriding WebSocket function...");
    window.WebSocket = function (url, protocols) {
        Log.info("WebSocket function is called!");
        Log.log("URL: " + url);
        let ws = new (Function.prototype.bind.call(_WebSocket, null, url, protocols));

        if (url && url.includes('/webcast/im/') && url.includes(ROOM_ID)) {
            ws.addEventListener('message', function (msg) {  
                console.log(msg)
                Log.success("WebSocket message received! " + msg.data.byteLength + " bytes");
            })

            ws.addEventListener('close', () => {
                Log.warning("WebSocket closed!"); 
                LIVE_ENDED = true;
            })
        }

        return ws;
    }
    Log.success("WebSocket function is overridden!");

    // override Response.json function
    Log.log("Overriding Response.json function...");
    window.Response.prototype.json = function () {
        return new Promise((resolve, reject) => {
            _ResponseJson.apply(this).then(json => {
                resolve(json);

                if (json?.data?.liveRoom?.streamId && !roomInfoProcessed) {
                    roomInfoProcessed = true;
                    roomId = json?.data?.user?.roomId || "unknown";

                    if (roomId === "unknown") {
                        console.log("roomId not detected!");
                    }

                    console.log('roomInfo', { liveRoomUserInfo: json.data, liveRoomStatus: json.data.liveRoom?.status });
                }
            }).catch(reject);
        })
    };
    Log.success("Response.json function is overridden!");

 


    function detectRoomInfo() {
        if (PAGE_INFO_DETECTED) return;

        Log.log("Detecting room info...");
        const sigiSateElement = document.getElementById('SIGI_STATE');
        if (!sigiSateElement) {
            Log.error("SIGI_STATE not found!");
            return;
        }
        Log.info("SIGI_STATE found!");

        Log.log("Parsing SIGI_STATE...");
        const sigiStateJson = sigiSateElement.innerText;
        if(!sigiStateJson) {
            Log.error("SIGI_STATE is empty!");
            return;
        }
        Log.info("SIGI_STATE parsed!");

        Log.log("Checking if SIGI_STATE is a valid JSON...");
        PAGE_INFO = JSON.parse(sigiStateJson);
        if(!PAGE_INFO) {
            Log.error("SIGI_STATE is not a valid JSON!");
            return;
        }
        Log.info("SIGI_STATE is a valid JSON!");

        Log.log("Checking if SIGI_STATE has LiveRoom...");
        if(typeof PAGE_INFO.LiveRoom !== "object") {
            Log.error("pageInfo.LiveRoom is not an object!");
            return;
        }
        Log.info("SIGI_STATE has LiveRoom!");

        Log.log("Checking if SIGI_STATE has LiveRoom.liveRoomUserInfo...");
        if(typeof PAGE_INFO.LiveRoom.liveRoomUserInfo !== "object") {
            Log.error("pageInfo.LiveRoom.liveRoomUserInfo is not an object!");
            return;
        }
        Log.info("SIGI_STATE has LiveRoom.liveRoomUserInfo!");

        Log.log("Checking if SIGI_STATE has LiveRoom.liveRoomUserInfo.user...");
        if(typeof PAGE_INFO.LiveRoom.liveRoomUserInfo.user !== "object") {
            Log.error("pageInfo.LiveRoom.liveRoomUserInfo.user is not an object!");
            return;
        }
        Log.info("SIGI_STATE has LiveRoom.liveRoomUserInfo.user!");

        ROOM_ID = PAGE_INFO.LiveRoom.liveRoomUserInfo.user.roomId; 
        if (!ROOM_ID) {
            Log.error("Room ID not found!");
            return;
        } 
        Log.success("Room ID detected: " + ROOM_ID);

        if(ROOM_ID === "unknown") {
            Log.error("Room ID is unknown!");
            return;
        }  

        Log.log("Checking if SIGI_STATE has AppContext...");
        if(typeof PAGE_INFO.AppContext !== "object") {
            Log.error("pageInfo.AppContext is not an object!");
            return;
        }
        Log.info("SIGI_STATE has AppContext!");

        Log.log("Checking if SIGI_STATE has AppContext.appContext...");
        if(typeof PAGE_INFO.AppContext.appContext !== "object") {
            Log.error("pageInfo.AppContext.appContext is not an object!");
            return;
        }
        Log.info("SIGI_STATE has AppContext.appContext!");

        Log.log("Checking if SIGI_STATE has AppContext.appContext.user...");
        if(typeof PAGE_INFO.AppContext.appContext.user !== "object") {
            Log.error("pageInfo.AppContext.appContext.user is not an object!");
            Log.warning("Please login to TikTok and join a live stream!");
            return;
        }
        Log.info("SIGI_STATE has AppContext.appContext.user!");

        Log.log("Checking if SIGI_STATE has AppContext.appContext.user.uid...");
        if(!PAGE_INFO.AppContext.appContext.user.uid) {
            Log.error("pageInfo.AppContext.appContext.user.uid not found!");
            Log.warning("Please login to TikTok and join a live stream!");
            return;
        }
        Log.info("SIGI_STATE has AppContext.appContext.user.uid!");
        
        USER_ID = PAGE_INFO.AppContext.appContext.user.uid; 
        Log.success("User ID detected: " + USER_ID);

        PAGE_INFO_DETECTED = true; 

        // https://www.tiktok.com/@*/live gibi bir url olacak, içinden streamer username alınabilir. regex ile al.
        const regex = /@([^\s/]+)/g;
        const found = window.location.href.match(regex);
        if(found && found.length > 0) {
            STREAMER_USERNAME = found[0].replace('@', '');
            Log.success("Streamer username detected: " + STREAMER_USERNAME);
        }
        onDetectRoomInfo();
    };

    function onDetectRoomInfo() {
        Log.success("Room info detected!");
        Log.success("Room ID: " + ROOM_ID);
        Log.success("User ID: " + USER_ID);

        disableVideoAndAudio(true);
        startHeartbeat();
    };

    function disableVideoAndAudio(isFirstTime = false) {
        if(isFirstTime) {
            Log.log("Disabling video and audio...");
        }  
        document.querySelectorAll("video, audio").forEach(element => { 
            if (element.muted && element.paused) return;
            element.muted = true;
            element.pause();
            Log.success( element.tagName + " muted and paused!");
        }); 
    }

    function checkLiveEnded() {
        if (document.querySelector('[class*="LiveEndContainer"]') !== null) {
            LIVE_ENDED = true;
        }
    }

    function startHeartbeat(){ 
        setInterval(function(){  
            console.log("Heartbeat sent!");
            checkLiveEnded();
            disableVideoAndAudio();
            if(LIVE_ENDED) {
                Log.warning("Live ended!");
                return;
            }
            if(!PAGE_INFO_DETECTED) {
                Log.error("Room info not detected!");
                return;
            }
            chrome.runtime.sendMessage({
                type: "TIKTAKGAMES_HEARTBEAT",
                payload: {
                    ACCOUNT_UUID,
                    GAME_UUID,
                    ROOM_ID,
                    USER_ID,
                    STREAMER_USERNAME,
                    PAGE_INFO,
                    USER_AGENT,
                }
            });
            Log.heartbeat("Heartbeat sent!");
        }, 3000);
    }


    function run() { 
        // run detectRoomInfo every 1 second until it's detected
        const interval = setInterval(() => {
            if (PAGE_INFO_DETECTED) {
                clearInterval(interval);
                return;
            }
            detectRoomInfo();
        }, 1000);
    }

 

 
    document.addEventListener('DOMContentLoaded', () => {
        run();
    });
 

})();


(function() {
    // Orijinal WebSocket nesnesini saklama
    var OriginalWebSocket = window.WebSocket;
  
    // Yeni WebSocket oluşturma
    function NewWebSocket(url, protocols) {
      console.log("WebSocket isteği yapıldı. URL:", url);
      // İstediğiniz herhangi bir işlemi yapabilirsiniz.
      // Burada sadece orijinal WebSocket'i çağırıyoruz.
      return new OriginalWebSocket(url, protocols);
    }
  
    // window.WebSocket'i değiştirme
    window.WebSocket = NewWebSocket;
  })();