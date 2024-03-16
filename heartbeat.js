// ==UserScript==
// @name         TikTok Live Heartbeat
// @namespace    https://tiktakgames.com.tr/
// @version      0.9
// @description  Script to send heartbeat to TikTok live streams to keep them alive
// @author       TikTakGames
// @match        https://www.tiktok.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tiktok.com
// @grant        none
// @run-at       document-start
// ==/UserScript==


(function () {
    'use strict';  

    // LOCATION_HASH #tiktakgames ile başlamıyorsa çalıştırma
    if (!window.location.hash.includes("#tiktakgames")) { 
        console.log("TikTok Live Heartbeat is not started because it's not started with #tiktakgames");
        return;
    }

    const BASE_URL = window.location.href; 


    class Log {
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

        static getLogContainer() {
            let logContainerInner = document.querySelector('.tiktak-games-log-container > .tiktak-games-log-container-inner');
            if(!logContainerInner) {
                const logContainer = document.createElement('div');
                logContainer.className = 'tiktak-games-log-container';
                logContainer.style.position = 'fixed';
                logContainer.style.bottom = '10px';
                logContainer.style.left = '10px';
                logContainer.style.zIndex = '9999'; 
                logContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                logContainer.style.padding = '14px';
                logContainer.style.borderRadius = '4px';
                logContainer.style.color = '#fff';
                logContainer.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
                logContainer.style.transition = 'all 0.3s ease'; 
                logContainer.style.backdropFilter = 'blur(10px)';  
                document.body.appendChild(logContainer);

                logContainerInner = document.createElement('div');
                logContainerInner.className = 'tiktak-games-log-container-inner';
                logContainerInner.style.width = '500px';
                logContainerInner.style.height = '300px'; 
                logContainerInner.style.overflowY = 'auto';
                logContainer.appendChild(logContainerInner);

            }
            return logContainerInner;
        }
        

        static createLog(message, type) {
            const logContainer = Log.getLogContainer();
          
            const logElement = document.createElement('div'); 
            logElement.className = 'tiktak-games-log';
            const logTimeElement = document.createElement('span');
            logTimeElement.className = 'tiktak-games-log-time';
            logTimeElement.innerText = `[${new Date().toLocaleTimeString()}] `; 
            logTimeElement.style.fontFamily = 'consolas';
            logElement.appendChild(logTimeElement);
            const logMessageElement = document.createElement('span');
            logMessageElement.className = 'tiktak-games-log-message';
            logMessageElement.innerText = message;

            logMessageElement.style.fontFamily = 'consolas';

            switch (type) {
                case 'success':
                    logMessageElement.style.color = '#4caf50';
                    break;
                case 'error':
                    logMessageElement.style.color = '#f44336';
                    break;
                case 'warning':
                    logMessageElement.style.color = '#ff9800';
                    break;
                case 'info':
                    logMessageElement.style.color = '#2196f3';
                    break;
                default: 
                    logMessageElement.style.color = '#9e9e9e';
                    break;
            } 

            if (logContainer.children.length >= 50) {
                logContainer.removeChild(logContainer.children[0]);
            }
            logElement.appendChild(logMessageElement);
            logContainer.appendChild(logElement);
             
            logElement.scrollIntoView(); 
        }
    }

    class TikTokLiveHeartbeat {
        ROOM_ID = "";
        USER_ID = "";
        PAGE_INFO = null;
        PAGE_INFO_DETECTED = false;

        run = () => {
            Log.success("TikTok Live Heartbeat started!");

            // owerwrite native functions
            this.middleware();
 
            // run detectRoomInfo every 1 second until it's detected
            const interval = setInterval(() => {
                if (this.PAGE_INFO_DETECTED) {
                    clearInterval(interval);
                    return;
                }
                this.detectRoomInfo();
            }, 1000);
        }

        middleware = () => {
            // save native functions
            Log.log("Middleware started!");
            let _XMLHttpRequestOpen = window.XMLHttpRequest.prototype.open;
            let _WebSocket = window.WebSocket;
            let _ResponseJson = window.Response.prototype.json;
            Log.info("Native XMLHttpRequest.open, WebSocket and Response.json functions are saved!");

            // override native functions
            // override XMLHttpRequest.open function
            Log.log("Overriding XMLHttpRequest.open, WebSocket and Response.json functions...");
            window.XMLHttpRequest.prototype.open = function (method, url) {
                if (url && url.includes('/webcast/im/fetch') && url.includes(roomId) && url.includes('msToken')) {
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
                let ws = new (Function.prototype.bind.call(_WebSocket, null, url, protocols))();

                if (url && url.includes('/webcast/im/') && url.includes(roomId)) {
                    ws.addEventListener('message', function (msg) {
                        console.log(msg.data);
                    })

                    ws.addEventListener('close', () => {
                        console.log('wsClosed');
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
        };

        detectRoomInfo = () => {
            if (this.PAGE_INFO_DETECTED) return;

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
            this.PAGE_INFO = JSON.parse(sigiStateJson);
            if(!this.PAGE_INFO) {
                Log.error("SIGI_STATE is not a valid JSON!");
                return;
            }
            Log.info("SIGI_STATE is a valid JSON!");

            Log.log("Checking if SIGI_STATE has LiveRoom...");
            if(typeof this.PAGE_INFO.LiveRoom !== "object") {
                Log.error("pageInfo.LiveRoom is not an object!");
                return;
            }
            Log.info("SIGI_STATE has LiveRoom!");

            Log.log("Checking if SIGI_STATE has LiveRoom.liveRoomUserInfo...");
            if(typeof this.PAGE_INFO.LiveRoom.liveRoomUserInfo !== "object") {
                Log.error("pageInfo.LiveRoom.liveRoomUserInfo is not an object!");
                return;
            }
            Log.info("SIGI_STATE has LiveRoom.liveRoomUserInfo!");

            Log.log("Checking if SIGI_STATE has LiveRoom.liveRoomUserInfo.user...");
            if(typeof this.PAGE_INFO.LiveRoom.liveRoomUserInfo.user !== "object") {
                Log.error("pageInfo.LiveRoom.liveRoomUserInfo.user is not an object!");
                return;
            }
            Log.info("SIGI_STATE has LiveRoom.liveRoomUserInfo.user!");
 
            this.ROOM_ID = this.PAGE_INFO.LiveRoom.liveRoomUserInfo.user.roomId; 
            if (!this.ROOM_ID) {
                Log.error("Room ID not found!");
                return;
            } 
            Log.success("Room ID detected: " + this.ROOM_ID);
 
            if(this.ROOM_ID === "unknown") {
                Log.error("Room ID is unknown!");
                return;
            }  

            Log.log("Checking if SIGI_STATE has AppContext...");
            if(typeof this.PAGE_INFO.AppContext !== "object") {
                Log.error("pageInfo.AppContext is not an object!");
                return;
            }
            Log.info("SIGI_STATE has AppContext!");

            Log.log("Checking if SIGI_STATE has AppContext.appContext...");
            if(typeof this.PAGE_INFO.AppContext.appContext !== "object") {
                Log.error("pageInfo.AppContext.appContext is not an object!");
                return;
            }
            Log.info("SIGI_STATE has AppContext.appContext!");

            Log.log("Checking if SIGI_STATE has AppContext.appContext.user...");
            if(typeof this.PAGE_INFO.AppContext.appContext.user !== "object") {
                Log.error("pageInfo.AppContext.appContext.user is not an object!");
                Log.warning("Please login to TikTok and join a live stream!");
                return;
            }
            Log.info("SIGI_STATE has AppContext.appContext.user!");

            Log.log("Checking if SIGI_STATE has AppContext.appContext.user.uid...");
            if(!this.PAGE_INFO.AppContext.appContext.user.uid) {
                Log.error("pageInfo.AppContext.appContext.user.uid not found!");
                Log.warning("Please login to TikTok and join a live stream!");
                return;
            }
            Log.info("SIGI_STATE has AppContext.appContext.user.uid!");
            
            this.USER_ID = this.PAGE_INFO.AppContext.appContext.user.uid; 
            Log.success("User ID detected: " + this.USER_ID);

             
            this.PAGE_INFO_DETECTED = true; 
            this.onDetectRoomInfo();
        };
        onDetectRoomInfo = () => {
            Log.success("Room info detected!");
            Log.success("Room ID: " + this.ROOM_ID);
            Log.success("User ID: " + this.USER_ID);

            // this.disableVideoAndAudio();
        };

        disableVideoAndAudio = () => {
            Log.log("Disabling video and audio...");
            document.querySelectorAll("video, audio").forEach(element => {
                element.muted = true;
                element.pause();
            });
            Log.success("Video and audio disabled!");
        }

        checkLiveEnd = () => {
            if (document.querySelector('[class*="LiveEndContainer"]') !== null) {
                this.onLiveEnd();
            }
        };
        onLiveEnd = () => {
            Log.warning("Live stream ended!");

        };
  
    }

    const heartbeat = new TikTokLiveHeartbeat();

    if(document.body) {
        heartbeat.run();
    }
    else {
        document.addEventListener('DOMContentLoaded', () => {
            heartbeat.run();
        });
    } 
})();