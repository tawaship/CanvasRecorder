/*!
 * @tawaship/canvas-recorder - v1.0.0
 * 
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */
var CanvasRecorder = function() {
    "use strict";
    /*!
     * @tawaship/emitter - v3.0.0
     * 
     * @author tawaship (makazu.mori@gmail.com)
     * @license MIT
     */    var Emitter = function() {
        this._events = {};
    }, prototypeAccessors = {
        eventNames: {
            configurable: !0
        }
    };
    prototypeAccessors.eventNames.get = function() {
        return Object.keys(this._events);
    }, Emitter.prototype._on = function(type, func, once) {
        if (!type || !func) {
            return this;
        }
        for (var events = this._events[type] = this._events[type] || [], i = 0; i < events.length; i++) {
            if (events[i].func === func) {
                return this;
            }
        }
        return events.push({
            func: func,
            once: once
        }), this;
    }, Emitter.prototype.on = function(type, func) {
        return this._on(type, func, !1);
    }, Emitter.prototype.once = function(type, func) {
        return this._on(type, func, !0);
    }, Emitter.prototype.off = function(type, func) {
        if (!type || !func) {
            return this;
        }
        for (var events = this._events[type] || [], i = 0; i < events.length; i++) {
            if (events[i].func === func) {
                return events.splice(i, 1), this;
            }
        }
        return this;
    }, Emitter.prototype.emit = function(type) {
        for (var args = [], len = arguments.length - 1; len-- > 0; ) {
            args[len] = arguments[len + 1];
        }
        if (!type) {
            return this;
        }
        for (var events = this._events[type] || [], use = [], i = events.length - 1; i >= 0; i--) {
            var ev = events[i];
            ev.once && events.splice(i, 1), use.push(ev);
        }
        for (var i$1 = use.length - 1; i$1 >= 0; i$1--) {
            use[i$1].func.apply(this, args);
        }
        return this;
    }, Emitter.prototype.cemit = function(type, context) {
        for (var args = [], len = arguments.length - 2; len-- > 0; ) {
            args[len] = arguments[len + 2];
        }
        if (!type || null == context) {
            return this;
        }
        for (var events = this._events[type] || [], use = [], i = events.length - 1; i >= 0; i--) {
            var ev = events[i];
            ev.once && events.splice(i, 1), use.push(ev);
        }
        for (var i$1 = use.length - 1; i$1 >= 0; i$1--) {
            use[i$1].func.apply(context, args);
        }
        return this;
    }, Emitter.prototype.clear = function(type) {
        return void 0 === type && (type = ""), type ? delete this._events[type] : this._events = {}, 
        this;
    }, Object.defineProperties(Emitter.prototype, prototypeAccessors);
    var defaultUserAudioTrackConstraints = {
        channelCount: 2
    }, Movie = function(blob) {
        this._blobURL = window.URL.createObjectURL(blob);
    };
    Movie.prototype.createVideoElement = function() {
        if (!this._blobURL) {
            throw new Error("[CanvasRecorder] This movie instance was destroyed.");
        }
        var video = document.createElement("video");
        return video.src = this._blobURL, video.setAttribute("controls", ""), video;
    }, Movie.prototype.download = function() {
        if (!this._blobURL) {
            throw new Error("[CanvasRecorder] This movie instance was destroyed.");
        }
        var anchor = document.createElement("a");
        anchor.download = location.hostname + "_" + (new Date).toLocaleString().replace(/[\/\s\:]/g, "-") + ".webm", 
        anchor.href = this._blobURL, anchor.click();
    }, Movie.prototype.destroy = function() {
        window.URL.revokeObjectURL(this._blobURL), this._blobURL = null;
    };
    var CanvasRecorder = function(canvas, recordOptions) {
        var this$1 = this;
        void 0 === recordOptions && (recordOptions = {}), this._buildPromise = null, this._buildEmitter = new Emitter, 
        this._movie = null;
        var stream = new MediaStream;
        canvas.captureStream().getVideoTracks().forEach((function(track) {
            stream.addTrack(track);
        }));
        var blobList = [];
        this._recorder = new MediaRecorder(stream, recordOptions), this._recorder.addEventListener("dataavailable", (function(e) {
            blobList.push(e.data);
        })), this._recorder.addEventListener("stop", (function(e) {
            this$1._buildEmitter.emit("finish", blobList), blobList = [];
        }));
    };
    return CanvasRecorder.prototype.start = function(timeslice) {
        var this$1 = this;
        "inactive" === this._recorder.state && (this._movie && (this._movie.destroy(), this._movie = null), 
        this._buildPromise = new Promise((function(resolve) {
            this$1._buildEmitter.once("finish", (function(blobList) {
                var movieBlob = new Blob(blobList, {
                    type: blobList[0].type
                });
                this$1._movie = new Movie(movieBlob), resolve(this$1._movie);
            }));
        })), this._recorder.start(timeslice));
    }, CanvasRecorder.prototype.finishAsync = function() {
        return "recording" !== this._recorder.state || this._recorder.stop(), this._buildPromise;
    }, CanvasRecorder.prototype.pause = function() {
        "recording" === this._recorder.state && this._recorder.pause();
    }, CanvasRecorder.prototype.resume = function() {
        "paused" === this._recorder.state && this._recorder.resume();
    }, CanvasRecorder.prototype.addAudioAsync = function(audioOptions) {
        var this$1 = this;
        return void 0 === audioOptions && (audioOptions = {
            display: !0
        }), Promise.resolve().then((function() {
            if (!audioOptions.user) {
                return Promise.resolve();
            }
            var userTrackConstraints = !0 === audioOptions.user ? defaultUserAudioTrackConstraints : audioOptions.user;
            return navigator.mediaDevices.getUserMedia({
                audio: userTrackConstraints
            }).then((function(userStream) {
                userStream.getAudioTracks().forEach((function(track) {
                    this$1._recorder.stream.addTrack(track);
                }));
            }));
        })).then((function() {
            if (!audioOptions.display) {
                return Promise.resolve();
            }
            var displayTrackConstraints = !0 === audioOptions.display ? defaultUserAudioTrackConstraints : audioOptions.display;
            return navigator.mediaDevices.getDisplayMedia({
                audio: displayTrackConstraints
            }).then((function(displayStream) {
                displayStream.getAudioTracks().forEach((function(track) {
                    this$1._recorder.stream.addTrack(track);
                }));
            }));
        }));
    }, CanvasRecorder;
}();
//# sourceMappingURL=CanvasRecorder.js.map
