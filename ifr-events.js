/*
IFR Events
Author: Eddy Pérez
Url: https://github.com/eddypvz/IFR-events
* */

window.IfrEvents = function () {

    const eventPrefix = 'IfrEvents-'

    const inIframe = function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    this.sendDataToParent = function (eventName, data) {
        if (inIframe()) {
            setInterval(function () {
                if (!data) data = {};
                window.parent.postMessage({name: eventPrefix + eventName, payload: data}, "*");
            }, 500);
        }
    }

    this.captureDataFromChildren = function (eventName, callback) {
        window.addEventListener("message", (event) => {
            if (event.data && event.data.name === eventPrefix + eventName) {
                callback(event.data.payload);
            }
        });
    }
}