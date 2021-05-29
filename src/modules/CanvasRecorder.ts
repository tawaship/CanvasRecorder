import { Emitter } from '@tawaship/emitter';

/**
 * @ignore
 */
declare class MediaRecorder {
	/**
	 * @ignore
	 */
	constructor(...args: any[]);
	
	/**
	 * @ignore
	 */
	[props: string]: any;
}

/**
 * @ignore
 */
declare interface MediaRecordOptions {
	/**
	 * @ignore
	 */
	[props: string]: any;
};

/**
 * @ignore
 */
declare type HTMLCanvasElement = any;

/**
 * [[https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties]]
 */
export interface AudioOptions {
	user?: boolean | MediaTrackConstraints;
	display?: boolean | MediaTrackConstraints;
}

export interface FactoryOption {
	framerate?: number;
	audioOptions?: AudioOptions;
	/**
	 * [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder/MediaRecorder#Syntax]]
	 */
	recordOptions?: MediaRecordOptions;
}

/**
 * @private
 */
const defaultUserAudioTrackConstraints: MediaTrackConstraints = { channelCount: 2 } as MediaTrackConstraints;

/**
 * @private
 */
const defaultDisplayAudioTrackConstraints: MediaTrackConstraints = { channelCount: 2 } as MediaTrackConstraints;

/**
 * @ignore
 */
declare const navigator: any;

/**
 * @private
 */
class Movie {
	private _blobURL: string;
	
	constructor(blob: Blob) {
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
	
	download(filename?: string) {
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
export class CanvasRecorder {
	/**
	 * [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder]]
	 */
	private _recorder: MediaRecorder;
	
	private _buildPromise: Promise<Movie> = null;
	
	private _buildEmitter: Emitter = new Emitter();
	
	private _movie: Movie = null;
	
	private [DisplayStream]: MediaStream = null;
	
	private [UserStream]: MediaStream = null;
	
	/**
	 * @param stream [[https://developer.mozilla.org/ja/docs/Web/API/MediaStream]]
	 * @param recordOptions [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder/MediaRecorder#Syntax]]
	 */
	constructor(stream: MediaStream, recordOptions: MediaRecordOptions = {}) {
		let blobList: Blob[] = [];
		
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
	start(timeslice: number) {
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
	
	private _releaseDisplayStream() {
		if (this[DisplayStream]) {
			this[DisplayStream].getTracks().forEach(track => track.stop());
		}
	}
	
	private _releaseUserStream() {
		if (this[UserStream]) {
			this[UserStream].getTracks().forEach(track => track.stop());
		}
	}
	
	disabled(flag: boolean) {
		this._recorder.stream.getTracks().forEach(track => track.enabled = !flag);
	}
	
	hide(flag: boolean) {
		this._recorder.stream.getVideoTracks().forEach(track => track.enabled = !flag);
	}
	
	mute(flag: boolean) {
		this._recorder.stream.getAudioTracks().forEach(track => track.enabled = !flag);
	}
	
	addAudioAsync(audioOptions: AudioOptions = { display: true }) {
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
					})
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
						streams.push(stream)
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
	static createAsync(canvas: HTMLCanvasElement, factoryOptions?: FactoryOption) {
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
	static createWithAudioAsync(canvas: HTMLCanvasElement, factoryOptions?: FactoryOption) {
		factoryOptions = factoryOptions || {};
		
		const audioOptions = factoryOptions.audioOptions || { display: true };
		
		return CanvasRecorder.createAsync(canvas, factoryOptions)
			.then(recorder => {
				return recorder.addAudioAsync(audioOptions)
					.then(() => recorder);
			});
	}
}