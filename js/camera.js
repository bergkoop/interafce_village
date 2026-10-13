// camera.js: walking around the tavern

// The text you see when you arrive somewhere
const CAPTIONS = {
    overview: 'Click somewhere in the room to walk there.',
    fireplace: 'You sit down by the fire and listen to the music.',
    board: 'You walk up to the quest board.',
    bard: 'You walk over to the bard.',
};

const CAPTION_TIME = 3500; // how long a caption stays, in milliseconds

const camera = document.querySelector('.camera');
const caption = document.querySelector('#caption');
const navButtons = document.querySelectorAll('.nav button');

let captionTimer;

// Shows a short text at the top of the screen that fades away by itself
const showCaption = (text) => {
    caption.textContent = text;
    caption.classList.add('visible');

    // Stop the old timer, otherwise a new caption could disappear too early
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => caption.classList.remove('visible'), CAPTION_TIME);
};

// Starts the camera.
// onViewChange is a callback: a function that gets called every time you walk somewhere.
export const initCamera = (onViewChange) => {
    // Moves the camera. JS only says WHERE you are, the CSS transition does the moving.
    const goTo = (view) => {
        if (camera.dataset.view === view) {
            return; // you're already there
        }

        camera.dataset.view = view;
        showCaption(CAPTIONS[view]);

        navButtons.forEach((button) => {
            button.classList.toggle('active', button.dataset.go === view);
        });

        console.log(`Walked to: ${view}`);
        onViewChange(view);
    };

    // One listener for everything with data-go: the spots in the room and the menu buttons
    document.addEventListener('click', (event) => {
        const target = event.target.closest('[data-go]');
        if (target) {
            goTo(target.dataset.go);
        }
    });

    // Escape brings you back to the overview
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            goTo('overview');
        }
    });

    showCaption(CAPTIONS.overview);
};
