// effects.js: small animations made with the Web Animations API (element.animate)
// element.animate() gives back an Animation object, and animation.finished is a Promise,
// so you can wait for an animation with await.

// People who turned off animations in their OS settings get no animations here either
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const speed = (ms) => (reducedMotion.matches ? 0 : ms);

// Turns a card halfway, changes what's on it, then turns it back
export const flipCard = async (element, changeContent) => {
    const firstHalf = element.animate(
        [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }],
        { duration: speed(300), easing: 'ease-in', fill: 'forwards' }
    );
    await firstHalf.finished;

    // The card is now sideways, so nobody sees the content change
    changeContent();

    const secondHalf = element.animate(
        [{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0deg)' }],
        { duration: speed(300), easing: 'ease-out', fill: 'forwards' }
    );
    await secondHalf.finished;

    // Clean up, so the card goes back to its normal CSS
    firstHalf.cancel();
    secondHalf.cancel();
};

// Makes an element pop in: a bit too big first, then normal size
export const pop = (element) => element.animate(
    [
        { transform: 'scale(0.6)', opacity: 0 },
        { transform: 'scale(1.08)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1)', opacity: 1 },
    ],
    { duration: speed(400), easing: 'ease-out' }
);

// A quick bump, like a coin purse that just got heavier
export const bump = (element) => element.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
    { duration: speed(400), easing: 'ease-out' }
);

// Shows a small text (like "+300") that drifts down and fades away
export const floatText = async (element, text) => {
    const span = document.createElement('span');
    span.className = 'float-text';
    span.textContent = text;
    element.append(span);

    await span.animate(
        [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(2.5rem)', opacity: 0 }],
        { duration: speed(1200), easing: 'ease-out', fill: 'forwards' }
    ).finished;

    span.remove();
};

// The element leans toward your mouse, using the --tilt-x and --tilt-y CSS variables
export const addTilt = (element, maxAngle = 10) => {
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (!canHover || reducedMotion.matches) {
        return; // no mouse (phone) or no animations wanted
    }

    element.addEventListener('mousemove', (event) => {
        const box = element.getBoundingClientRect();

        // Where the mouse is on the element: -0.5 (left/top) to 0.5 (right/bottom)
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;

        element.style.setProperty('--tilt-x', `${-y * maxAngle * 2}deg`);
        element.style.setProperty('--tilt-y', `${x * maxAngle * 2}deg`);
    });

    element.addEventListener('mouseleave', () => {
        element.style.setProperty('--tilt-x', '0deg');
        element.style.setProperty('--tilt-y', '0deg');
    });
};
