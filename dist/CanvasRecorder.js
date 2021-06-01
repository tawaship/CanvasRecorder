/*!
 * @tawaship/canvas-recorder - v1.1.1
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
     */    var _a, _b, Emitter = function() {
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
    }, prototypeAccessors$1 = {
        blobURL: {
            configurable: !0
        }
    };
    Movie.prototype.createVideoElement = function() {
        if (!this._blobURL) {
            throw new Error("[CanvasRecorder] This movie instance was destroyed.");
        }
        var video = document.createElement("video");
        return video.src = this._blobURL, video.setAttribute("controls", ""), video;
    }, Movie.prototype.download = function(filename) {
        if (!this._blobURL) {
            throw new Error("[CanvasRecorder] This movie instance was destroyed.");
        }
        var anchor = document.createElement("a");
        anchor.download = filename ? filename + ".webm" : location.hostname + "_" + (new Date).toLocaleString().replace(/[\/\s\:]/g, "-") + ".webm", 
        anchor.href = this._blobURL, anchor.click();
    }, prototypeAccessors$1.blobURL.get = function() {
        if (!this._blobURL) {
            throw new Error("[CanvasRecorder] This movie instance was destroyed.");
        }
        return this._blobURL;
    }, Movie.prototype.destroy = function() {
        window.URL.revokeObjectURL(this._blobURL), this._blobURL = null;
    }, Object.defineProperties(Movie.prototype, prototypeAccessors$1);
    var DisplayStream = Symbol(), UserStream = Symbol(), CanvasRecorder = function(stream, recordOptions) {
        var this$1 = this;
        void 0 === recordOptions && (recordOptions = {}), this._buildPromise = null, this._buildEmitter = new Emitter, 
        this._movie = null, this[_a] = null, this[_b] = null;
        var blobList = [];
        this._recorder = new MediaRecorder(stream, recordOptions), this._recorder.addEventListener("dataavailable", (function(e) {
            blobList.push(e.data);
        })), this._recorder.addEventListener("stop", (function(e) {
            this$1._buildEmitter.emit("finish", blobList), blobList = [];
        }));
    };
    return CanvasRecorder.prototype.start = function(timeslice) {
        var this$1 = this;
        "inactive" === this._recorder.state && (this.clearMovie(), this._buildPromise = new Promise((function(resolve) {
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
    }, CanvasRecorder.prototype.clearMovie = function() {
        this._movie && (this._movie.destroy(), this._movie = null);
    }, CanvasRecorder.prototype.destroy = function() {
        this.clearMovie(), this._recorder.stream.getTracks().forEach((function(track) {
            return track.stop();
        })), this._releaseDisplayStream(), this._releaseUserStream();
    }, CanvasRecorder.prototype._releaseDisplayStream = function() {
        this[DisplayStream] && this[DisplayStream].getTracks().forEach((function(track) {
            return track.stop();
        }));
    }, CanvasRecorder.prototype._releaseUserStream = function() {
        this[UserStream] && this[UserStream].getTracks().forEach((function(track) {
            return track.stop();
        }));
    }, CanvasRecorder.prototype.disabled = function(flag) {
        this._recorder.stream.getTracks().forEach((function(track) {
            return track.enabled = !flag;
        }));
    }, CanvasRecorder.prototype.hide = function(flag) {
        this._recorder.stream.getVideoTracks().forEach((function(track) {
            return track.enabled = !flag;
        }));
    }, CanvasRecorder.prototype.mute = function(flag) {
        this._recorder.stream.getAudioTracks().forEach((function(track) {
            return track.enabled = !flag;
        }));
    }, CanvasRecorder.prototype.addAudioAsync = function(audioOptions) {
        var this$1 = this;
        void 0 === audioOptions && (audioOptions = {
            display: !0
        });
        var streams = [];
        return Promise.resolve().then((function() {
            if (!audioOptions.display) {
                return Promise.resolve();
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                return Promise.reject();
            }
            this$1._releaseDisplayStream();
            var displayTrackConstraints = !0 === audioOptions.display ? defaultUserAudioTrackConstraints : audioOptions.display;
            return navigator.mediaDevices.getDisplayMedia({
                audio: displayTrackConstraints,
                video: !0
            }).then((function(stream) {
                this$1[DisplayStream] = stream, stream.getVideoTracks().forEach((function(track) {
                    return track.stop();
                })), streams.push(stream);
            }));
        })).catch((function(e) {
            console.error(e), console.warn("[CanvasRecorder] Can not use display media.");
        })).then((function() {
            if (!audioOptions.user) {
                return Promise.resolve();
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return Promise.reject();
            }
            this$1._releaseUserStream();
            var userTrackConstraints = !0 === audioOptions.user ? defaultUserAudioTrackConstraints : audioOptions.user;
            return navigator.mediaDevices.getUserMedia({
                audio: userTrackConstraints
            }).then((function(stream) {
                this$1[UserStream] = stream, stream.getVideoTracks().forEach((function(track) {
                    return track.stop();
                })), streams.push(stream);
            }));
        })).catch((function(e) {
            console.error(e), console.warn("[CanvasRecorder] Can not use user media.");
        })).then((function() {
            if (streams.length) {
                if (streams.reduce((function(total, stream) {
                    return total + stream.getAudioTracks().length;
                }), 0)) {
                    if (!AudioContext) {
                        return console.warn('[CanvasRecorder] Priority is given to "display media" as multiple audio tracks cannot be used.'), 
                        void streams.forEach((function(stream) {
                            return stream.getAudioTracks().forEach((function(track) {
                                return this$1._recorder.stream.addTrack(track);
                            }));
                        }));
                    }
                    var audioContext = new AudioContext, destination = audioContext.createMediaStreamDestination();
                    streams.forEach((function(stream) {
                        return audioContext.createMediaStreamSource(stream).connect(destination);
                    })), this$1._recorder.stream.addTrack(destination.stream.getAudioTracks()[0]);
                } else {
                    console.warn("[CanvasRecorder] No audio stream.");
                }
            } else {
                console.warn("[CanvasRecorder] No audio stream.");
            }
        }));
    }, CanvasRecorder.createAsync = function(canvas, factoryOptions) {
        var framerate = (factoryOptions = factoryOptions || {}).framerate || 60, recordOptions = factoryOptions.recordOptions || {}, stream = new MediaStream;
        return canvas.captureStream(framerate).getVideoTracks().forEach((function(track) {
            stream.addTrack(track);
        })), Promise.resolve(new CanvasRecorder(stream, recordOptions));
    }, CanvasRecorder.createWithAudioAsync = function(canvas, factoryOptions) {
        var audioOptions = (factoryOptions = factoryOptions || {}).audioOptions || {
            display: !0
        };
        return CanvasRecorder.createAsync(canvas, factoryOptions).then((function(recorder) {
            return recorder.addAudioAsync(audioOptions).then((function() {
                return recorder;
            }));
        }));
    }, _a = DisplayStream, _b = UserStream, CanvasRecorder;
}();
//# sourceMappingURL=CanvasRecorder.js.map
