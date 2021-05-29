/*!
 * @tawaship/canvas-recorder - v1.1.0
 * 
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */

/*!
 * @tawaship/emitter - v3.0.0
 * 
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */

class Emitter {
    constructor() {
        this._events = {};
    }
    /**
     * Registered event names.
     *
     * @since 1.1.1
     */
    get eventNames() {
        return Object.keys(this._events);
    }
    /**
     * Register event.
     *
     * @param type Event type.
     * @param func Callback when the event fires.
     * @param once Whether one-time event.
     * @return Returns itself for the method chaining.
     */
    _on(type, func, once) {
        if (!type || !func) {
            return this;
        }
        const events = this._events[type] = this._events[type] || [];
        for (let i = 0; i < events.length; i++) {
            if (events[i].func === func) {
                return this;
            }
        }
        events.push({ func, once });
        return this;
    }
    /**
     * Register event.
     *
     * @param type Event type.
     * @param func Callback when the event fires.
     * @return Returns itself for the method chaining.
     */
    on(type, func) {
        return this._on(type, func, false);
    }
    /**
     * Register one-time event.
     *
     * @param type Event type.
     * @param func Callback when the event fires.
     * @return Returns itself for the method chaining.
     */
    once(type, func) {
        return this._on(type, func, true);
    }
    /**
     * Unregister event.
     *
     * @param type Event type.
     * @param func Registered callback.
     * @return Returns itself for the method chaining.
     */
    off(type, func) {
        if (!type || !func) {
            return this;
        }
        const events = this._events[type] || [];
        for (let i = 0; i < events.length; i++) {
            if (events[i].func === func) {
                events.splice(i, 1);
                return this;
            }
        }
        return this;
    }
    /**
     * Emit event.
     *
     * @param type Event type to emit.
     * @param args Argument(s) in callback.
     * @return Returns itself for the method chaining.
     */
    emit(type, ...args) {
        if (!type) {
            return this;
        }
        const events = this._events[type] || [];
        const use = [];
        for (let i = events.length - 1; i >= 0; i--) {
            const ev = events[i];
            if (ev.once) {
                events.splice(i, 1);
            }
            use.push(ev);
        }
        for (let i = use.length - 1; i >= 0; i--) {
            use[i].func.apply(this, args);
        }
        return this;
    }
    /**
     * Emit event with specifying a context.
     *
     * @param type Event type to emit.
     * @param context 'this' context in callback.
     * @param args Argument(s) in callback.
     * @return Returns itself for the method chaining.
     */
    cemit(type, context, ...args) {
        if (!type || context == null) {
            return this;
        }
        const events = this._events[type] || [];
        const use = [];
        for (let i = events.length - 1; i >= 0; i--) {
            const ev = events[i];
            if (ev.once) {
                events.splice(i, 1);
            }
            use.push(ev);
        }
        for (let i = use.length - 1; i >= 0; i--) {
            use[i].func.apply(context, args);
        }
        return this;
    }
    /**
     * Remove events grouped event type.
     *
     * @param type Event type to remove.<br>If it is empty, removes all events.
     * @return Returns itself for the method chaining.
     */
    clear(type = '') {
        if (type) {
            delete (this._events[type]);
        }
        else {
            this._events = {};
        }
        return this;
    }
}

var _a, _b;
/**
 * @private
 */
const defaultUserAudioTrackConstraints = { channelCount: 2 };
/**
 * @private
 */
class Movie {
    constructor(blob) {
        this._blobURL = window.URL.createObjectURL(blob);
    }
    /**
     * [[https://developer.mozilla.org/en/docs/Web/API/HTMLVideoElement]]
     */
    createVideoElement() {
        if (!this._blobURL) {
            throw new Error('[CanvasRecorder] This movie instance was destroyed.');
        }
        const video = document.createElement('video');
        video.src = this._blobURL;
        video.setAttribute('controls', '');
        return video;
    }
    download(filename) {
        if (!this._blobURL) {
            throw new Error('[CanvasRecorder] This movie instance was destroyed.');
        }
        const anchor = document.createElement('a');
        anchor.download = filename ? `${filename}.webm` : `${location.hostname}_${new Date().toLocaleString().replace(/[\/\s\:]/g, '-')}.webm`;
        anchor.href = this._blobURL;
        anchor.click();
    }
    get blobURL() {
        if (!this._blobURL) {
            throw new Error('[CanvasRecorder] This movie instance was destroyed.');
        }
        return this._blobURL;
    }
    destroy() {
        window.URL.revokeObjectURL(this._blobURL);
        this._blobURL = null;
    }
}
/**
 * @ignore
 */
const DisplayStream = Symbol();
/**
 * @ignore
 */
const UserStream = Symbol();
/*
 * This API reference does not contain information for the parent class "MediaRecorder".<br />
 * For more information on "MediaRecorder", please refer to the following URL.<br />
 * [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder]]
 */
class CanvasRecorder {
    /**
     * @param stream [[https://developer.mozilla.org/ja/docs/Web/API/MediaStream]]
     * @param recordOptions [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder/MediaRecorder#Syntax]]
     */
    constructor(stream, recordOptions = {}) {
        this._buildPromise = null;
        this._buildEmitter = new Emitter();
        this._movie = null;
        this[_a] = null;
        this[_b] = null;
        let blobList = [];
        this._recorder = new MediaRecorder(stream, recordOptions);
        this._recorder.addEventListener('dataavailable', e => {
            blobList.push(e.data);
        });
        this._recorder.addEventListener('stop', e => {
            this._buildEmitter.emit('finish', blobList);
            blobList = [];
        });
    }
    /**
     * Start recording
     * @param timeslice [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder/start#Syntax]]
     */
    start(timeslice) {
        if (this._recorder.state !== 'inactive') {
            return;
        }
        this.clearMovie();
        this._buildPromise = new Promise(resolve => {
            this._buildEmitter.once('finish', blobList => {
                const movieBlob = new Blob(blobList, { type: blobList[0].type });
                this._movie = new Movie(movieBlob);
                resolve(this._movie);
            });
        });
        this._recorder.start(timeslice);
    }
    /**
     * Finish recording and create a video file.
     */
    finishAsync() {
        if (this._recorder.state !== 'recording') {
            return this._buildPromise;
        }
        this._recorder.stop();
        return this._buildPromise;
    }
    /**
     * Pause recording.
     */
    pause() {
        if (this._recorder.state !== 'recording') {
            return;
        }
        this._recorder.pause();
    }
    /**
     * Resume recording.
     */
    resume() {
        if (this._recorder.state !== 'paused') {
            return;
        }
        this._recorder.resume();
    }
    clearMovie() {
        if (this._movie) {
            this._movie.destroy();
            this._movie = null;
        }
    }
    destroy() {
        this.clearMovie();
        this._recorder.stream.getTracks().forEach(track => track.stop());
        this._releaseDisplayStream();
        this._releaseUserStream();
    }
    _releaseDisplayStream() {
        if (this[DisplayStream]) {
            this[DisplayStream].getTracks().forEach(track => track.stop());
        }
    }
    _releaseUserStream() {
        if (this[UserStream]) {
            this[UserStream].getTracks().forEach(track => track.stop());
        }
    }
    disabled(flag) {
        this._recorder.stream.getTracks().forEach(track => track.enabled = !flag);
    }
    hide(flag) {
        this._recorder.stream.getVideoTracks().forEach(track => track.enabled = !flag);
    }
    mute(flag) {
        this._recorder.stream.getAudioTracks().forEach(track => track.enabled = !flag);
    }
    addAudioAsync(audioOptions = { display: true }) {
        const streams = [];
        return Promise.resolve()
            .then(() => {
            if (!audioOptions.display) {
                return Promise.resolve();
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                return Promise.reject();
            }
            this._releaseDisplayStream();
            const displayTrackConstraints = audioOptions.display === true ? defaultUserAudioTrackConstraints : audioOptions.display;
            return navigator.mediaDevices.getDisplayMedia({ audio: displayTrackConstraints, video: true })
                .then(stream => {
                this[DisplayStream] = stream;
                stream.getVideoTracks().forEach(track => track.stop());
                streams.push(stream);
            });
        })
            .catch(e => {
            console.error(e);
            console.warn('[CanvasRecorder] Can not use display media.');
        })
            .then(() => {
            if (!audioOptions.user) {
                return Promise.resolve();
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return Promise.reject();
            }
            this._releaseUserStream();
            const userTrackConstraints = audioOptions.user === true ? defaultUserAudioTrackConstraints : audioOptions.user;
            return navigator.mediaDevices.getUserMedia({ audio: userTrackConstraints })
                .then(stream => {
                this[UserStream] = stream;
                stream.getVideoTracks().forEach(track => track.stop());
                streams.push(stream);
            });
        })
            .catch(e => {
            console.error(e);
            console.warn('[CanvasRecorder] Can not use user media.');
        })
            .then(() => {
            if (!streams.length) {
                console.warn('[CanvasRecorder] No audio stream.');
                return;
            }
            const audioTrackNum = streams.reduce((total, stream) => {
                return total + stream.getAudioTracks().length;
            }, 0);
            if (!audioTrackNum) {
                console.warn('[CanvasRecorder] No audio stream.');
                return;
            }
            if (!AudioContext) {
                console.warn('[CanvasRecorder] Priority is given to "display media" as multiple audio tracks cannot be used.');
                streams.forEach(stream => stream.getAudioTracks().forEach(track => this._recorder.stream.addTrack(track)));
                return;
            }
            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();
            streams.forEach(stream => audioContext.createMediaStreamSource(stream).connect(destination));
            this._recorder.stream.addTrack(destination.stream.getAudioTracks()[0]);
        });
    }
    /**
     * @param canvas [[https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement]]
     * @param factoryOptions
     */
    static createAsync(canvas, factoryOptions) {
        factoryOptions = factoryOptions || {};
        const framerate = factoryOptions.framerate || 60;
        const recordOptions = factoryOptions.recordOptions || {};
        const stream = new MediaStream();
        canvas.captureStream(framerate).getVideoTracks().forEach(track => {
            stream.addTrack(track);
        });
        return Promise.resolve(new CanvasRecorder(stream, recordOptions));
    }
    /**
     * @param canvas [[https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement]]
     * @param factoryOptions
     */
    static createWithAudioAsync(canvas, factoryOptions) {
        factoryOptions = factoryOptions || {};
        const audioOptions = factoryOptions.audioOptions || { display: true };
        return CanvasRecorder.createAsync(canvas, factoryOptions)
            .then(recorder => {
            return recorder.addAudioAsync(audioOptions)
                .then(() => recorder);
        });
    }
}
_a = DisplayStream, _b = UserStream;

export { CanvasRecorder };
//# sourceMappingURL=CanvasRecorder.esm.js.map
