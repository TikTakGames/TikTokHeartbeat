const nativeWebSocket = window.WebSocket; 
window.WebSocket = function(url, protocols) { 
    // kullanılacak cookileri de al
    const cookies = document.cookie;

    window.postMessage({from: 'TIKTAKGAMES_HOOK_WEBSOCKET', data: { 
        url, 
        protocols,
        cookies,
    }}, '*'); 
    // eğer url /webcast/im/ içeriyorsa blokla
    if (url.indexOf('/webcast/im/') > -1) {
        return;
    } 
    return new nativeWebSocket(url, protocols); 
};


