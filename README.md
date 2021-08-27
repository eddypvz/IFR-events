# IFR-events (Iframe Events)
Permite manejar eventos de iframes hacia sus ventanas padres.

### Métodos disponibles


**sendDataToParent**

Este médodo permite enviar información desde un iframe hijo, hacia la ventana padre.

```javascript

// creamos una instancia de IfrEvents
const eventHandler = IfrEvents.getInstance();

eventHandler.sendDataToParent('identificador_del_evento', {
    data: {
        info_a_mandar: 12345,
    },
    target_domain: '*', // dominio de la ventana padre, no se recomienda *
    success: function () {
        console.log('se envió data con éxito');
    },
    error: function () {
        console.log('falló el envío de data');
    }
});
```

**sendDataToChild**

Este médodo permite enviar información desde una ventana padre, hacia un iframe hijo.

```javascript

// creamos una instancia de IfrEvents
const eventHandler = IfrEvents.getInstance();

eventHandler.sendDataToChild('identificador_del_evento', {
    iframe_id: 'id_de_iframe', // id del iframe hijo
    data: {
        info_a_mandar: 12345,
    },
    target_domain: '*', // dominio del iframe hijo, no se recomienda *
    success: function () {
        console.log('se envió data con éxito');
    },
    error: function () {
        console.log('falló el envío de data');
    }
});
```

**captureData**

Este médodo permite capturar información enviada por los métodos anteriores.

```javascript

// creamos una instancia de IfrEvents
const eventHandler = IfrEvents.getInstance();

eventHandler.captureData('SeleccionDePaciente', function (data, event_info) {
    console.log(data); // Data recibida
    console.log(event_info); // Información del evento
    
    // du stuff
});
```