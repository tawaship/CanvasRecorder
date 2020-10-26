const assert = require('assert');
const { CanvasRecorder } = require('../');

describe('CanvasRecorder', () => {
	it('create', () => {
		const canvas = document.createElement('canvas');
		
		return CanvasRecorder.createAsync(canvas)
			.then(recorder => {
				recorder.start();
				setTimeout(() => {
					recorder.finishAsync()
						.then(movie => {
							recorder.destroy();
						});
				}, 1000);
			});
	});
	
	it('createWithAudio', () => {
		const canvas = document.createElement('canvas');
		
		return CanvasRecorder.createWithAudioAsync(canvas)
			.then(recorder => {
				recorder.start();
				setTimeout(() => {
					recorder.finishAsync()
						.then(movie => {
							recorder.destroy();
						});
				}, 1000);
			});
	});
	
	it('constructor', () => {
		const canvas = document.createElement('canvas');
		
		const recorder = new CanvasRecorder(canvas.captureStream())
		recorder.start();
		setTimeout(() => {
			recorder.finishAsync()
				.then(movie => {
					recorder.destroy();
				});
		}, 1000);
	});
});