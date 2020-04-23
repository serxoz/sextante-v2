// Agregar mapa
var map = L.map('map', {
    crs: L.CRS.Simple
});

var bounds = [[0,0], [864,1200]];
var image = L.imageOverlay('map1.jpg', bounds).addTo(map);

map.fitBounds(bounds);

// Marcador de ejemplo
//var marker = L.marker([51.5, 55.09]).addTo(map);

// Click largo para crear marcador
var mousedownInterval;  
var interval=500;       // tempo a manter o click pulsado en milisegundos	  
var lock=false;         // evita que se spamee o click mentras se mantén pulsado
                        // Non vai fino, cando moves varias veces o mapa rompe.

const crearMarcador = (event) => {
    if(event && lock != true) {
        lock = true;
        let latlng = map.mouseEventToLatLng(event.originalEvent);
        let marker = L.marker(latlng).addTo(map);

        let footer = `
            <br>
            <div id="footer">
                <button class="editar">Editar</button>
                <button class="borrar">Borrar</button>
            </div>
        `;

        marker.bindPopup(footer).openPopup();  

        // Eventos dentro del popup
        marker.on("popupopen", (ev) => {
            let mrkr = ev.popup._source; // Este marcador
            console.log(mrkr);

            // borrar marcador
            $('.borrar').on("click", e => {
                map.removeLayer(mrkr);
            });

            // abre modal edición
            $('.editar').on("click", e => {
                mrkr.closePopup();

                map.openModal({ content: `
                    <br><br>
                    <form id="editForm">
                        <textarea id="contenido"></textarea>   <br><br>
                        <input type="submit" value="Guardar">
                    </form> 
                `});

                // Carga o contido salvado no textarea
                $("#contenido").val($("#savedContent").html())

                // Modifica o textarea cun editor chachito
                ClassicEditor
                    .create( document.querySelector( '#contenido' ), {
                        toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
                    } )
                    .catch( error => {
                        console.error( error );
                    } );
                    
                // guardado del formulario de edición
                $('#editForm').submit((e) => {
                    e.preventDefault();
                    let contenido = $("#contenido").val();

                    let popupContent = '<div id="savedContent">' + contenido + '</div>' + footer;
                    mrkr.setPopupContent(popupContent);
                    
                    map.closeModal();
                    mrkr.openPopup();                    
                });
            });
        })
    }		
}

map.on('mousedown', (event) => {
    mousedownInterval = setInterval(crearMarcador, interval, event);
});

map.on('mouseup', () => {
    lock = false;  //libera o bloqueo de creación de marcadores
    clearInterval(mousedownInterval);
});

map.on('move', () => {
    // bloquea a creacion de marcadores durante o 
    // movemento do mapa.
    lock = true;
})