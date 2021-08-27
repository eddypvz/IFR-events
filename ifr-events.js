/*
IFR Events
Author: Eddy Pérez
Url: https://github.com/eddypvz/IFR-events
* */

const IfrEvents = (function () {
    let instance;

    function CreateInstance() {

        // event handler
        const eventHandler = {};
        eventHandler['send'] = {};
        eventHandler['receive'] = {};

        const inIframe = function () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        }

        const showError = function (strError) {
            console.log('IFR-Events: ' + strError)
        }

        const registerEvent = function (eventName, type, onSuccessCallback, onErrorCallback) {

            if (type === 'send') {
                if (typeof eventHandler['send'][eventName] === 'undefined') {
                    eventHandler['send'][eventName] = {}
                }
                eventHandler['send'][eventName]['name'] = eventName;
                eventHandler['send'][eventName]['checksum'] = null;
                eventHandler['send'][eventName]['sending'] = 0;
                eventHandler['send'][eventName]['callback_success'] = onSuccessCallback;
                eventHandler['send'][eventName]['callback_error'] = onErrorCallback;
            }
            else {
                if (typeof eventHandler['receive'][eventName] === 'undefined') {
                    eventHandler['receive'][eventName] = {}
                }
                eventHandler['receive'][eventName]['name'] = eventName;
                eventHandler['receive'][eventName]['checksum'] = null;
                eventHandler['receive'][eventName]['sending'] = 0;
                eventHandler['receive'][eventName]['callback_success'] = onSuccessCallback;
                eventHandler['receive'][eventName]['callback_error'] = onErrorCallback;
            }
        }

        const tryToSend = function (eventName, dataToSend, windowDestinationObject, targetDomain) {

            eventHandler['send'][eventName]['sending'] = 1;
            eventHandler['send'][eventName]['checksum'] = Date.now();

            if (typeof windowDestinationObject.postMessage === 'function') {

                const eventObj = {
                    name: eventHandler['send'][eventName]['name'],
                    checksum: eventHandler['send'][eventName]['checksum'],
                    data: dataToSend,
                };

                windowDestinationObject.postMessage({name: 'IFR-EVENTS-CONTROL-COMUNICATION', payload: eventObj}, targetDomain);

                // espero por respuesta
                let timer = 0;
                let waitForResponse = setInterval(function () {
                    if (eventHandler['send'][eventName]['sending'] === 0) {
                        clearInterval(waitForResponse);

                        if (typeof eventHandler['send'][eventName]['callback_success'] === 'function') {
                            eventHandler['send'][eventName]['callback_success']();
                        }
                    }
                    else {
                        timer = timer+100;
                    }

                    // for wait timeout
                    if (timer > 3000) {
                        clearInterval(waitForResponse);
                        if (typeof eventHandler['send'][eventName]['callback_error'] === 'function') {
                            eventHandler['send'][eventName]['callback_error']();
                        }
                    }
                }, 100);
            }
            else {
                showError("Destination can't be located for send messages");
            }
        }

        this.sendDataToParent = function (eventName, params) {

            const dataToSend = (!params.data) ? {} : params.data;
            const target_domain = (!params.target_domain) ? '*' : params.target_domain;
            const successCallback = (!params.success) ? null : params.success;
            const errorCallback = (!params.error) ? null : params.error;

            if (inIframe()) {

                // register the event
                registerEvent(eventName, 'send', successCallback, errorCallback);

                // set the target
                const target = (!target_domain) ? '*' : target_domain;

                // try to send
                tryToSend(eventName, dataToSend, window.parent, target);
            }
            else {
                console.log('IFR-Events: You need to be in an iframe to send data, event:' +eventName);
            }
        }

        this.sendDataToChild = function (eventName, params) {

            const dataToSend = (!params.data) ? {} : params.data;
            const iframeID = (!params.iframe_id) ? '' : params.iframe_id;
            const target_domain = (!params.target_domain) ? '*' : params.target_domain;
            const successCallback = (!params.success) ? null : params.success;
            const errorCallback = (!params.error) ? null : params.error;

            // register the event
            registerEvent(eventName, 'send', successCallback, errorCallback);

            // set the target
            const target = (!target_domain) ? '*' : target_domain;

            // get iframe child window
            const iFrame = document.getElementById(iframeID);

            if (iFrame) {
                // try to send
                tryToSend(eventName, dataToSend, iFrame.contentWindow, target);
            }
            else {
                showError("Error sending data, the child iframe '"+iframeID+"' can't be located, check you iframe ID");
            }
        }

        this.captureData = function (eventName, callback) {
            const successCallback = (!callback) ? null : callback;
            registerEvent(eventName, 'receive', successCallback, null);
        }

        window.addEventListener("message", (event) => {
            if (event.data) {

                if (event.data.name === 'IFR-EVENTS-CONTROL-COMUNICATION') {

                    const eventToReceive = event.data.payload;

                    if (typeof eventHandler['receive'][eventToReceive.name] !== 'undefined') {
                        eventHandler['receive'][eventToReceive.name]['dispatched_times'] = eventToReceive.dispatched_times;
                        eventHandler['receive'][eventToReceive.name]['checksum'] = eventToReceive.checksum;

                        if (typeof event.source.postMessage === 'function') {

                            // if data is received ok
                            if (typeof eventHandler['receive'][eventToReceive.name]['callback_success'] === 'function') {
                                eventHandler['receive'][eventToReceive.name]['callback_success'](eventToReceive.data);
                            }

                            const flag = {
                                'name': eventToReceive.name,
                                'checksum': eventHandler['receive'][eventToReceive.name]['checksum'],
                                'status': 1,
                            };
                            event.source.postMessage({name: 'IFR-EVENTS-CONTROL-COMUNICATION-END', payload: flag}, event.origin);
                        }
                        else {
                            showError("Source window can't be located for send messages");
                        }
                    }
                    else {
                        console.log('IFR-Events: Receiving event not registered:' + eventToReceive.name);
                        /*console.log('IFR-Events: This event has not been registered, event:' + eventToReceive.name);*/
                    }
                }

                if (event.data.name === 'IFR-EVENTS-CONTROL-COMUNICATION-END') {

                    const eventToReceive = event.data.payload;

                    // if the control flag is ok
                    if (typeof eventToReceive.status !== 'undefined' && eventToReceive.status === 1) {
                        if (typeof eventHandler['send'][eventToReceive.name] !== 'undefined') {
                            if (eventToReceive.checksum === eventHandler['send'][eventToReceive.name]['checksum']) {
                                eventHandler['send'][eventToReceive.name]['sending'] = 0;
                            }
                        }
                        else {
                            console.log('IFR-Events: Receiving event not registered:' + eventToReceive.name);
                        }
                    }
                }
            }
        });
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = new CreateInstance();
            }
            return instance;
        }
    };
})();