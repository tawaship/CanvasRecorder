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

/**
 * @private
 */
const defaultUserAudioTrackConstraints: MediaTrackConstraints = { channelCount: 2 };

/**
 * @private
 */
const defaultDisplayAudioTrackConstraints: MediaTrackConstraints = { channelCount: 2 };

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
	
	createVideoElement() {
		if (!this._blobURL) {
			throw new Error('[CanvasRecorder] This movie instance was destroyed.');
		}
		
		const video = document.createElement('video');
		video.src = this._blobURL;
		video.setAttribute('controls', '');
		return video;
	}
	
	download() {
		if (!this._blobURL) {
			throw new Error('[CanvasRecorder] This movie instance was destroyed.');
		}
		
		const anchor = document.createElement('a');
		anchor.download = `${location.hostname}_${new Date().toLocaleString().replace(/[\/\s\:]/g, '-')}.webm`;
		anchor.href = this._blobURL;
		anchor.click();
	}
	
	destroy() {
		window.URL.revokeObjectURL(this._blobURL);
		this._blobURL = null;
	}
}

/**
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
	
	/**
	 * @param canvas [[https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement]]
	 * @param recordOptions [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder/MediaRecorder#Syntax]]
	 */
	constructor(canvas: HTMLCanvasElement, recordOptions: MediaRecordOptions = {}) {
		const stream = new MediaStream();
		
		canvas.captureStream().getVideoTracks().forEach(track => {
			stream.addTrack(track);
		});
		
		//this.buildPromise = Promise.resolve()
		
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
		
		if (this._movie) {
			this._movie.destroy();
			this._movie = null
		}
		
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
	
	addAudioAsync(audioOptions: AudioOptions = { display: true }) {
		return Promise.resolve()
			.then(() => {
				if (!audioOptions.user) {
					return Promise.resolve();
				}
				
				const userTrackConstraints = audioOptions.user === true ? defaultUserAudioTrackConstraints : audioOptions.user;
				return navigator.mediaDevices.getUserMedia({ audio: userTrackConstraints })
					.then(userStream => {
						userStream.getAudioTracks().forEach(track => {
							this._recorder.stream.addTrack(track);
						});
					});
			})
			.then(() => {
				if (!audioOptions.display) {
					return Promise.resolve();
				}
				
				const displayTrackConstraints = audioOptions.display === true ? defaultUserAudioTrackConstraints : audioOptions.display;
				return navigator.mediaDevices.getDisplayMedia({ audio: displayTrackConstraints })
					.then(displayStream => {
						displayStream.getAudioTracks().forEach(track => {
							this._recorder.stream.addTrack(track);
						});
					});
			});
	}
}