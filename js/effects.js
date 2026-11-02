const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const speed = (ms) => (reducedMotion.matches ? 0 : ms);

export const flipCard = async (element, changeContent) => {
    const firstHalf = element.animate(
        [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }],
        { duration: speed(300), easing: 'ease-in', fill: 'forwards' }
    );
    await firstHalf.finished;

    changeContent();

    const secondHalf = element.animate(
        [{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0deg)' }],
        { duration: speed(300), easing: 'ease-out', fill: 'forwards' }
    );
    await secondHalf.finished;

    firstHalf.cancel();
    secondHalf.cancel();
};

export const pop = (element) => element.animate(
    [
        { transform: 'scale(0.6)', opacity: 0 },
        { transform: 'scale(1.08)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1)', opacity: 1 },
    ],
    { duration: speed(400), easing: 'ease-out' }
);

export const bump = (element) => element.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
    { duration: speed(400), easing: 'ease-out' }
);

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

export const addTilt = (element, maxAngle = 10) => {
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (!canHover || reducedMotion.matches) {
        return; 
    }

    element.addEventListener('mousemove', (event) => {
        const box = element.getBoundingClientRect();

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
