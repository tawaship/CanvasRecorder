# CanvasRecorder

Save the canvas on the web page as a video.

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

---



## Install

### In the browser

```sh
git clone https://github.com/tawaship/CanvasRecorder.git
```

<br />

```html
<script src="/path/to/dist/CanvasRecorder.min.js"></script>
```

### NPM

```sh
npm install --save @tawaship/canvas-recorder
```

<br />

```javascript
import { CanvasRecorder } from '@tawaship/canvas-recorder';
const { CanvasRecorder } = require('@tawaship/canvas-recorder');
```

## Usage

### Only canvas

```javascript
const canvas = document.getElementsByTagName("canvas")[0]; // Canvas you want to record.
CanvasRecorder.createAsync(canvas)
	.then(recorder => {
		recorder.start();
		setTimeout(()=> {
			recorder.finishAsync()
				.then(movie => {
					movie.download();
				});
		}, 2000);
	});
```

### With audio

**<span style="color: red;">note:</span>**  
**When including the audio being played on the screen in the video, due to technical restrictions, we are executing `navigator.mediaDevices.getDisplayMedia()` to share the screen.**

**Only the audio is extracted without capturing the screen, and the screen sharing is canceled as soon as the recording ends.**

**Be very careful when using it, or do not run it if you are unreliable.**

```javascript
const canvas = document.getElementsByTagName("canvas")[0]; // Canvas you want to record.
CanvasRecorder.createWithAudioAsync(canvas)
	.then(recorder => {
		recorder.start();
		setTimeout(()=> {
			recorder.finishAsync()
				.then(movie => {
					movie.download();
				});
		}, 2000);
	});
```