/**
 * @ignore
 */
declare interface MediaRecordOptions {
    /**
     * @ignore
     */
    [props: string]: any;
}
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
declare class Movie {
    private _blobURL;
    constructor(blob: Blob);
    /**
     * [[https://developer.mozilla.org/en/docs/Web/API/HTMLVideoElement]]
     */
    createVideoElement(): HTMLVideoElement;
    download(filename?: string): void;
    get blobURL(): string;
    destroy(): void;
}
/**
 * @ignore
 */
declare const DisplayStream: unique symbol;
/**
 * @ignore
 */
declare const UserStream: unique symbol;
export declare class CanvasRecorder {
    /**
     * [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder]]
     */
    private _recorder;
    private _buildPromise;
    private _buildEmitter;
    private _movie;
    private [DisplayStream];
    private [UserStream];
    /**
     * @param stream [[https://developer.mozilla.org/ja/docs/Web/API/MediaStream]]
     * @param recordOptions [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder/MediaRecorder#Syntax]]
     */
    constructor(stream: MediaStream, recordOptions?: MediaRecordOptions);
    /**
     * Start recording
     * @param timeslice [[https://developer.mozilla.org/en/docs/Web/API/MediaRecorder/start#Syntax]]
     */
    start(timeslice: number): void;
    /**
     * Finish recording and create a video file.
     */
    finishAsync(): Promise<Movie>;
    /**
     * Pause recording.
     */
    pause(): void;
    /**
     * Resume recording.
     */
    resume(): void;
    clearMovie(): void;
    destroy(): void;
    private _releaseDisplayStream;
    private _releaseUserStream;
    disabled(flag: boolean): void;
    hide(flag: boolean): void;
    mute(flag: boolean): void;
    addAudioAsync(audioOptions?: AudioOptions): Promise<void>;
    /**
     * @param canvas [[https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement]]
     * @param factoryOptions
     */
    static createAsync(canvas: HTMLCanvasElement, factoryOptions?: FactoryOption): Promise<CanvasRecorder>;
    /**
     * @param canvas [[https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement]]
     * @param factoryOptions
     */
    static createWithAudioAsync(canvas: HTMLCanvasElement, factoryOptions?: FactoryOption): Promise<CanvasRecorder>;
}
export {};
