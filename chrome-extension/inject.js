document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM yüklendi');
    console.log(document);
    console.log(window);
    const nativeWebSocket = window.WebSocket; 
    window.WebSocket = function(url, protocols) {
        // Gelen WebSocket isteğini konsola yazdırın
        console.log('WebSocket:', url, protocols);
        
        // Yeni WebSocket nesnesi oluşturun
        const ws = new nativeWebSocket(url, protocols);
        
        // WebSocket üzerinde 'message' olayını dinleyin
        ws.addEventListener('message', function(event) {
            console.log('Message:', event.data);
        });
        
        // Oluşturulan WebSocket nesnesini geri döndürün
        return ws;
    }; 
});