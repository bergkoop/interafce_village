// main.js: the starting point, this file loads everything else

import { initCamera } from './camera.js';
import { initQuestBoard } from './questBoard.js';
import { initBard } from './bard.js';
import { initMusic, updateMusic } from './music.js';

console.log('The tavern is open!');

initQuestBoard();
initBard();
initMusic();

// updateMusic is passed as a callback: the camera calls it every time you walk somewhere
initCamera(updateMusic);
