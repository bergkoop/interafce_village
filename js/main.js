
import { initCamera } from './camera.js';
import { initQuestBoard } from './questBoard.js';
import { initBard } from './bard.js';
import { initMusic, updateMusic } from './music.js';

console.log('The tavern is open!');

initQuestBoard();
initBard();
initMusic();

initCamera(updateMusic);
