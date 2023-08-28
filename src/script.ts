// Interfaces
interface Coordinates {
    x: number;
    y: number;
}
interface indexedCoordinates extends Coordinates {
    index: number;
}

// HTML Elements
const addBtnEl = document.getElementById("add") as HTMLElement;
const colorModeBtnEl = document.getElementById("color-mode") as HTMLElement;
const settingsBoxEl = document.querySelector(".settings") as HTMLElement;
const fullScreenEl = document.getElementById("fullscreen") as HTMLElement;
const modalEl = document.getElementById("modal") as HTMLElement;
const modalContentEl = document.getElementById("modal-content") as HTMLElement;
const battleBtnEl = document.getElementById("battle") as HTMLElement;
const zenBtnEl = document.getElementById("zen") as HTMLElement;
const menuEl = document.getElementById("menu") as HTMLElement;
const battleMenuEl = document.getElementById("battle-menu") as HTMLElement;
const countdownEl = document.getElementById("countdown") as HTMLElement;
const addEmojiEls = document.getElementsByClassName("emoji");
const battleMenuEmojiEls = document.getElementsByClassName("hover-emoji");

// Game Variables
let gameMode = "";
const emojiSizes: Coordinates = { x: 55, y: 53 };
const windowMax: Coordinates = {
    x: window.innerWidth - emojiSizes.x,
    y: window.innerHeight - emojiSizes.y
};
let darkMode = localStorage.getItem("color-mode") === "true";
let elementArray: FloatingElement[] = [];
let emojis: string[] = ["🪨", "📄", "✂️"];
let selectedEmoji: string;

// Element Class
class FloatingElement {
    id: number;
    htmlElement: HTMLSpanElement;
    coordinates: Coordinates;
    increments: Coordinates;
    emoji: string;
    speed: number;

    constructor(id: number, emoji: string, coordinates?: Coordinates, increments?: Coordinates) {
        this.id = id;
        this.htmlElement = document.createElement("span");
        this.coordinates = coordinates || {
            x: randomNumber(0, windowMax.x),
            y: randomNumber(0, windowMax.y)
        };
        this.increments = increments || { x: coinFlip(-1, 1), y: coinFlip(-1, 1) };
        this.emoji = emoji;
        this.speed = 10;
    }

    init(isBattle?: boolean) {
        // Add to array of FloatingElements
        elementArray.push(this);

        // Update DOM
        this.htmlElement.innerText = this.emoji;
        this.updateDOM();
        document.body.appendChild(this.htmlElement);

        // Start Movement
        if (!isBattle) {
            return this.startMovement();
        }
    }

    startMovement() {
        return setInterval(() => this.movementInterval(), this.speed);
    }

    updateDOM() {
        this.htmlElement.setAttribute(
            "style",
            `left: ${this.coordinates.x}px; top: ${this.coordinates.y}px`
        );
    }

    movementInterval() {
        let wallBumped = false;

        // Wall Bumps
        if (this.wallBump(true)) {
            this.flipDirection(true);
            wallBumped = true;
        }
        if (this.wallBump(false)) {
            this.flipDirection(false);
            wallBumped = true;
        }

        // Shape Bumps
        if (!wallBumped) {
            this.shapeBump();
        }

        return this.moveElement();
    }

    moveElement(newCoords?: Coordinates) {
        this.coordinates = newCoords || {
            x: this.coordinates.x + this.increments.x,
            y: this.coordinates.y + this.increments.y
        };
        return this.updateDOM();
    }

    wallBump(isHorizontal: boolean) {
        const indexString = isHorizontal ? "x" : "y";
        const newCoordinate = this.coordinates[indexString] + this.increments[indexString];
        return newCoordinate > windowMax[indexString] || newCoordinate < 0;
    }

    shapeBump(isBattle?: boolean) {
        const { left, right, top, bottom } = this.htmlElement.getBoundingClientRect();

        for (let i = 0; i < elementArray.length; i++) {
            if (this.id !== elementArray[i].id) {
                const elementCoords = elementArray[i].htmlElement.getBoundingClientRect();

                if (
                    comparePositions([left, right], [elementCoords.left, elementCoords.right]) &&
                    comparePositions([top, bottom], [elementCoords.top, elementCoords.bottom])
                ) {
                    if (isBattle) {
                        return true;
                    }

                    const horizontalBump =
                        Math.abs(left - elementCoords.right) < 2 ||
                        Math.abs(right - elementCoords.left) < 2;
                    const verticalBump =
                        Math.abs(top - elementCoords.bottom) < 2 ||
                        Math.abs(bottom - elementCoords.top) < 2;

                    if (horizontalBump) {
                        this.flipDirection(true);
                        elementArray[i].flipDirection(true);
                    } else if (verticalBump) {
                        this.flipDirection(false);
                        elementArray[i].flipDirection(false);
                    }

                    // Type Bump Logic
                    const emojiIndex = emojis.indexOf(this.emoji);
                    const otherEmojiIndex = emojis.indexOf(elementArray[i].emoji);

                    switch (emojiIndex) {
                        case 0:
                            if (otherEmojiIndex === 1) {
                                this.updateEmoji(elementArray[i].emoji);
                            } else if (otherEmojiIndex === 2) {
                                elementArray[i].updateEmoji(this.emoji);
                            }
                            break;
                        case 1:
                            if (otherEmojiIndex === 2) {
                                this.updateEmoji(elementArray[i].emoji);
                            } else if (otherEmojiIndex === 0) {
                                elementArray[i].updateEmoji(this.emoji);
                            }
                            break;
                        default:
                            if (otherEmojiIndex === 0) {
                                this.updateEmoji(elementArray[i].emoji);
                            } else if (otherEmojiIndex === 1) {
                                elementArray[i].updateEmoji(this.emoji);
                            }
                            break;
                    }

                    this.moveElement();
                    elementArray[i].moveElement();

                    return;
                }
            }
        }
    }

    flipDirection(isHorizontal: boolean) {
        const indexString = isHorizontal ? "x" : "y";
        this.increments[indexString] = this.increments[indexString] * -1;
    }

    updateEmoji(newEmoji: string) {
        this.emoji = newEmoji;
        this.htmlElement.innerText = newEmoji;
    }
}

// Helper Functions
const toggleColorMode = () => {
    localStorage.setItem("color-mode", darkMode.toString());
    document.body.setAttribute("class", darkMode ? "dark" : "light");
    settingsBoxEl.style.color = darkMode ? "white" : "black";
    colorModeBtnEl.setAttribute("class", `fa-solid fa-${darkMode ? "sun" : "moon"}`);
};
const comparePositions = (shapeSidesOne: number[], shapeSidesTwo: number[]) => {
    // This function runs to compare two shapes to see if they are touching either horizontally or vertically.
    // The first step is to figure out which shape is the closest to the starting point of 0,0 on the screen.
    // The next step is determining if the opposite side of the closest shape is touching the opposing side of the other shape.

    let leftTopShape, rightBottomShape;
    if (shapeSidesOne[0] < shapeSidesTwo[0]) {
        leftTopShape = shapeSidesOne;
        rightBottomShape = shapeSidesTwo;
    } else {
        leftTopShape = shapeSidesTwo;
        rightBottomShape = shapeSidesOne;
    }

    return leftTopShape[1] > rightBottomShape[0] || leftTopShape[0] === rightBottomShape[0];
};
const randomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
const coinFlip = (a: any, b: any) => {
    return randomNumber(1, 10) > 5 ? a : b;
};
const menuSelect = (event: Event) => {
    event.preventDefault();
    const element = event.target as HTMLElement;

    gameMode = element.innerText;

    if (gameMode === "Zen Mode") {
        hideShowEl(settingsBoxEl, true);
        hideShowEl(modalEl, false);
    } else {
        hideShowEl(menuEl, false);
        hideShowEl(battleMenuEl, true);
    }
};
const hideShowEl = (element: HTMLElement, show: boolean) => {
    if (show) {
        element.classList.remove("d-none");
    } else {
        element.classList.add("d-none");
    }
};
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const countdownDOM = async (seconds: number) => {
    hideShowEl(modalContentEl, false);
    hideShowEl(countdownEl, true);

    for (let i = seconds; i >= 0; i--) {
        countdownEl.innerText = i == 0 ? "Go!" : i.toString();
        await delay(1000);
    }

    hideShowEl(countdownEl, false);
};
const battleStart = async () => {
    for (let i = 0; i < 30; i++) {
        const emoji = i < 10 ? emojis[0] : i < 20 ? emojis[1] : emojis[2];
        const newElement = new FloatingElement(elementArray.length, emoji);
        let loopCount = 0;

        newElement.init(true);
        while (newElement.shapeBump(true) && loopCount < 100) {
            newElement.moveElement({
                x: randomNumber(0, windowMax.x),
                y: randomNumber(0, windowMax.y)
            });
            loopCount++;
        }
    }

    hideShowEl(battleMenuEl, false);
    await countdownDOM(3);
    hideShowEl(modalEl, false);

    return elementArray.forEach(el => el.startMovement());
};

// Event Listeners
for (let i = 0; i < addEmojiEls.length; i++) {
    const element = addEmojiEls[i] as HTMLElement;
    element.addEventListener("click", () => {
        return new FloatingElement(elementArray.length, element.innerText).init();
    });
}
for (let i = 0; i < battleMenuEmojiEls.length; i++) {
    const element = battleMenuEmojiEls[i] as HTMLElement;
    element.addEventListener("click", (event: Event) => {
        const target = event.target as HTMLElement;
        const dataValue = target.getAttribute("data-emoji");

        if (dataValue) {
            selectedEmoji = dataValue;
        }

        return battleStart();
    });
}
colorModeBtnEl.addEventListener("click", () => {
    darkMode = !darkMode;
    return toggleColorMode();
});
fullScreenEl.addEventListener("click", () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        fullScreenEl.setAttribute("class", "fa-solid fa-expand");
        fullScreenEl.setAttribute("title", "Enter Fullscreen");
    } else {
        document.body.requestFullscreen();
        fullScreenEl.setAttribute("class", "fa-solid fa-minimize");
        fullScreenEl.setAttribute("title", "Exit Fullscreen");
    }
});
battleBtnEl.addEventListener("click", menuSelect);
zenBtnEl.addEventListener("click", menuSelect);

// Init
toggleColorMode();
if (!document.fullscreenEnabled) {
    fullScreenEl.style.display = "none";
}
