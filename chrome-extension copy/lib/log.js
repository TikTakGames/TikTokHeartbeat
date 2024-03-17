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

    static getTerminal() {

    }

    static getLogContainer() {
        let logContainer = document.querySelector('.tiktak-games-log-container');
        if(!logContainer) {
            const DASHBOARD_HTML = `<div style="position: fixed;left:10px;top: 35px;right:10px;bottom:10px;z-index: 999999;background-color: rgba(0,0,0,0.9);display: flex;flex-direction: column;border-radius: 10px;padding: 0px 10px 10px 10px;gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" 
                style=" width: 33%;  opacity: 0.1; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
                viewBox="0 0 63.67 64.26" xmlns:v="https://vecta.io/nano"><defs><clipPath id="A"><path d="M0 0h63.67v64.26H0z" fill="none" stroke-width="0"/></clipPath></defs><g clip-path="url(#A)" fill="#fff" fill-rule="evenodd"><path d="M58.07 54.62h-2.16c0-.2-.07-.37-.21-.51s-.31-.21-.51-.21h-3.62c-.14 0-.27.04-.39.11s-.21.17-.26.3a.73.73 0 0 0-.06.3.75.75 0 0 0 .05.26c.09.2.3.3.66.3h.91v2.17h-.91c-.66 0-1.21-.15-1.66-.44-.45-.3-.78-.68-.99-1.16-.15-.37-.22-.75-.22-1.14s.09-.75.23-1.11a2.77 2.77 0 0 1 1.05-1.29c.48-.32 1.01-.47 1.58-.45h3.62a2.71 2.71 0 0 1 2.03.85 2.74 2.74 0 0 1 .85 2.03m-9.37 3.26h2.16c0 .2.07.37.21.51s.31.21.51.21h3.62c.14 0 .27-.03.39-.1.12-.08.21-.18.26-.31a.73.73 0 0 0 .06-.3.8.8 0 0 0-.05-.26c-.09-.2-.3-.3-.66-.3h-.9v-2.17h.9c.66 0 1.21.15 1.66.44a2.64 2.64 0 0 1 .99 1.18c.15.36.23.74.22 1.13 0 .39-.09.75-.23 1.11-.21.54-.56.97-1.05 1.29-.48.32-1.01.47-1.59.45h-3.62a2.71 2.71 0 0 1-2.03-.85 2.74 2.74 0 0 1-.85-2.03zm-4.05-2.94v2.16H40.3v1.5h7.04v2.16h-9.2v-5.82h6.5zm-6.5-3.2h9.2v2.16H40.3v.54h-2.16v-2.7zm-13.05 9.02v-4.5h2.16v4.5h-2.16zm-.19-9.02h2.55l3.24 5.17 3.23-5.17h2.35v9.02h-2.16v-5.25l-2.15 3.45h-2.55l-4.52-7.22zm-8.58 9.02h-2.35l3.86-9.02h2.35l3.87 9.02H21.7l-.69-1.62h-2.52v-2.16h1.6l-1.07-2.5-2.69 6.28zm-8.2-7.04c-.47.2-.85.51-1.14.94s-.43.9-.43 1.42a2.44 2.44 0 0 0 .74 1.78c.49.49 1.09.74 1.79.74s1.29-.25 1.78-.75a2.76 2.76 0 0 0 .5-.69H9.08V55h4.68v1.09c0 .62-.12 1.21-.35 1.79-.24.57-.57 1.08-1.02 1.52-.44.44-.95.78-1.52 1.02a4.57 4.57 0 0 1-1.79.35c-.62 0-1.22-.12-1.79-.35-.57-.24-1.08-.57-1.52-1.02-.44-.44-.78-.95-1.02-1.52a4.57 4.57 0 0 1-.35-1.79 4.59 4.59 0 0 1 .8-2.61 4.69 4.69 0 0 1 2.12-1.74l.81 1.99zm4.43-.81l-1.6 1.45c-.24-.27-.52-.47-.85-.61a2.55 2.55 0 0 0-1.02-.21v-2.16c.65 0 1.28.13 1.88.4.61.27 1.14.64 1.58 1.13zm13.36-4.03H1v14.37h60.48V48.89H35.62l-4.39-5.36-4.38 5.36h-.93zM9.11 33.48l5.15-3.42v16.26H9.11V33.48zm13.27-8.54H1v5.12h21.38v-5.12zm11.64 0h-5.59l-9.15 21.39h5.59l1.07-2.52h0l3.62-8.44h0l1.68-3.93 1.33 3.12 3.4 7.92.66 1.54.99 2.31h5.58l-9.18-21.39zM44.89 1h-5.12v12.84h5.12V1zm17.78 0h-6.53L40.68 20.34l-.06.06-1.49 1.98h6.44l5.15-6.44 4.54 6.44h6.22l-7.44-10.61L62.67 1zM33.8 22.38h-5.12V9.54l5.12-3.42v16.26zM33.8 1h-5.12v5.12h5.12V1zM9.11 9.54l5.15-3.42v16.26H9.11V9.54zM22.38 1H1v5.12h21.38V1z"/><path d="M44.89 24.94h-5.12v12.84h5.12V24.94zm17.78 0h-6.53L40.68 44.28l-.06.06-1.49 1.98h6.44l5.15-6.44 4.54 6.44h6.22l-7.44-10.61 8.63-10.77z"/></g></svg>
            
                <div style="">
                    <div style="display: table;background-color: #f43f5e;padding: 14px 24px;border-radius: 999999px;margin: 0 auto;font-family:consolas;font-size: 20px;color: white;text-align: center;transform: translateY(-50%);">
                        Yayın boyunca bu sayfayı böylece açık tutun. Keep this page open throughout the broadcast. 
                    </div>
                </div> 
                <div style="color:#fff; flex:1; overflow-y: auto; " class="tiktak-games-log-container">
                    <div style="font-size:30px">TikTakGames. Interactive Game Platform</div>
                </div> 
            </div>`
            // DASHBOARD_HTML i body e ekle
            let e = document.createElement('div');
            e.innerHTML = DASHBOARD_HTML;
            document.body.appendChild(e);
            logContainer = document.querySelector('.tiktak-games-log-container'); 

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
            Log.queue.forEach(log => {
                Log.createLog(log.message, log.type);
            });
            Log.queue = [];
        }
        const logContainer = Log.getLogContainer();
      
        const logElement = document.createElement('div'); 
        logElement.className = 'tiktak-games-log';
        const logTimeElement = document.createElement('span'); 
        logTimeElement.innerText = `[${new Date().toLocaleTimeString()}] `; 
        logTimeElement.style.fontFamily = 'consolas';
        logElement.appendChild(logTimeElement);
        const logMessageElement = document.createElement('span'); 
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

        if (logContainer.children.length >= 300) {
            logContainer.removeChild(logContainer.children[0]);
        }
        logElement.appendChild(logMessageElement);
        logContainer.appendChild(logElement);

        let isHover = logContainer.getAttribute('data-hover') === 'true';
        if(!isHover) logElement.scrollIntoView(); 
    }
}

module.exports = Log;