const assert = require('assert');
const { CanvasRecorder } = require('../');

describe('CanvasRecorder', () => {
	it('create', () => {
		const canvas = document.createElement('canvas');
		
		return CanvasRecorder.createAsync(canvas)
			.then(recorder => {
				recorder.start();
				
				return recorder.finishAsync()
					.then(movie => {
						recorder.destroy();
					});
			});
	});
	
	it('createWithAudio', () => {
		const canvas = document.createElement('canvas');
		
		return CanvasRecorder.createWithAudioAsync(canvas)
			.then(recorder => {
				recorder.start();
				
				return recorder.finishAsync()
					.then(movie => {
						recorder.destroy();
					});
			});
	});
	
	it('constructor', () => {
		const canvas = document.createElement('canvas');
		
		const recorder = new CanvasRecorder(canvas.captureStream())
		recorder.start();
		
		return recorder.finishAsync()
			.then(movie => {
				recorder.destroy();
			});
	});
});