"use strict";
const addBtnEl = document.getElementById("add");
const colorModeBtnEl = document.getElementById("color-mode");
const settingsBoxEl = document.querySelector(".settings");
const fullScreenEl = document.getElementById("fullscreen");
const modalEl = document.getElementById("modal");
const modalContentEl = document.getElementById("modal-content");
const battleBtnEl = document.getElementById("battle");
const zenBtnEl = document.getElementById("zen");
const menuEl = document.getElementById("menu");
const battleMenuEl = document.getElementById("battle-menu");
const countdownEl = document.getElementById("countdown");
const addEmojiEls = document.getElementsByClassName("emoji");
const battleMenuEmojiEls = document.getElementsByClassName("hover-emoji");
let gameMode = "";
const emojiSizes = { x: 55, y: 53 };
const windowMax = {
    x: window.innerWidth - emojiSizes.x,
    y: window.innerHeight - emojiSizes.y
};
let darkMode = localStorage.getItem("color-mode") === "true";
let elementArray = [];
let emojis = ["🪨", "📄", "✂️"];
let selectedEmoji;
class FloatingElement {
    id;
    htmlElement;
    coordinates;
    increments;
    emoji;
    speed;
    constructor(id, emoji, coordinates, increments) {
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
    init(isBattle) {
        elementArray.push(this);
        this.htmlElement.innerText = this.emoji;
        this.updateDOM();
        document.body.appendChild(this.htmlElement);
        if (!isBattle) {
            return this.startMovement();
        }
    }
    startMovement() {
        return setInterval(() => this.movementInterval(), this.speed);
    }
    updateDOM() {
        this.htmlElement.setAttribute("style", `left: ${this.coordinates.x}px; top: ${this.coordinates.y}px`);
    }
    movementInterval() {
        let wallBumped = false;
        if (this.wallBump(true)) {
            this.flipDirection(true);
            wallBumped = true;
        }
        if (this.wallBump(false)) {
            this.flipDirection(false);
            wallBumped = true;
        }
        if (!wallBumped) {
            this.shapeBump();
        }
        return this.moveElement();
    }
    moveElement(newCoords) {
        this.coordinates = newCoords || {
            x: this.coordinates.x + this.increments.x,
            y: this.coordinates.y + this.increments.y
        };
        return this.updateDOM();
    }
    wallBump(isHorizontal) {
        const indexString = isHorizontal ? "x" : "y";
        const newCoordinate = this.coordinates[indexString] + this.increments[indexString];
        return newCoordinate > windowMax[indexString] || newCoordinate < 0;
    }
    shapeBump(isBattle) {
        const { left, right, top, bottom } = this.htmlElement.getBoundingClientRect();
        for (let i = 0; i < elementArray.length; i++) {
            if (this.id !== elementArray[i].id) {
                const elementCoords = elementArray[i].htmlElement.getBoundingClientRect();
                if (comparePositions([left, right], [elementCoords.left, elementCoords.right]) &&
                    comparePositions([top, bottom], [elementCoords.top, elementCoords.bottom])) {
                    if (isBattle) {
                        return true;
                    }
                    const horizontalBump = Math.abs(left - elementCoords.right) < 2 ||
                        Math.abs(right - elementCoords.left) < 2;
                    const verticalBump = Math.abs(top - elementCoords.bottom) < 2 ||
                        Math.abs(bottom - elementCoords.top) < 2;
                    if (horizontalBump) {
                        this.flipDirection(true);
                        elementArray[i].flipDirection(true);
                    }
                    else if (verticalBump) {
                        this.flipDirection(false);
                        elementArray[i].flipDirection(false);
                    }
                    const emojiIndex = emojis.indexOf(this.emoji);
                    const otherEmojiIndex = emojis.indexOf(elementArray[i].emoji);
                    switch (emojiIndex) {
                        case 0:
                            if (otherEmojiIndex === 1) {
                                this.updateEmoji(elementArray[i].emoji);
                            }
                            else if (otherEmojiIndex === 2) {
                                elementArray[i].updateEmoji(this.emoji);
                            }
                            break;
                        case 1:
                            if (otherEmojiIndex === 2) {
                                this.updateEmoji(elementArray[i].emoji);
                            }
                            else if (otherEmojiIndex === 0) {
                                elementArray[i].updateEmoji(this.emoji);
                            }
                            break;
                        default:
                            if (otherEmojiIndex === 0) {
                                this.updateEmoji(elementArray[i].emoji);
                            }
                            else if (otherEmojiIndex === 1) {
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
    flipDirection(isHorizontal) {
        const indexString = isHorizontal ? "x" : "y";
        this.increments[indexString] = this.increments[indexString] * -1;
    }
    updateEmoji(newEmoji) {
        this.emoji = newEmoji;
        this.htmlElement.innerText = newEmoji;
    }
}
const toggleColorMode = () => {
    localStorage.setItem("color-mode", darkMode.toString());
    document.body.setAttribute("class", darkMode ? "dark" : "light");
    settingsBoxEl.style.color = darkMode ? "white" : "black";
    colorModeBtnEl.setAttribute("class", `fa-solid fa-${darkMode ? "sun" : "moon"}`);
};
const comparePositions = (shapeSidesOne, shapeSidesTwo) => {
    let leftTopShape, rightBottomShape;
    if (shapeSidesOne[0] < shapeSidesTwo[0]) {
        leftTopShape = shapeSidesOne;
        rightBottomShape = shapeSidesTwo;
    }
    else {
        leftTopShape = shapeSidesTwo;
        rightBottomShape = shapeSidesOne;
    }
    return leftTopShape[1] > rightBottomShape[0] || leftTopShape[0] === rightBottomShape[0];
};
const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
const coinFlip = (a, b) => {
    return randomNumber(1, 10) > 5 ? a : b;
};
const menuSelect = (event) => {
    event.preventDefault();
    const element = event.target;
    gameMode = element.innerText;
    if (gameMode === "Zen Mode") {
        hideShowEl(settingsBoxEl, true);
        hideShowEl(modalEl, false);
    }
    else {
        hideShowEl(menuEl, false);
        hideShowEl(battleMenuEl, true);
    }
};
const hideShowEl = (element, show) => {
    if (show) {
        element.classList.remove("d-none");
    }
    else {
        element.classList.add("d-none");
    }
};
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const countdownDOM = async (seconds) => {
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
for (let i = 0; i < addEmojiEls.length; i++) {
    const element = addEmojiEls[i];
    element.addEventListener("click", () => {
        return new FloatingElement(elementArray.length, element.innerText).init();
    });
}
for (let i = 0; i < battleMenuEmojiEls.length; i++) {
    const element = battleMenuEmojiEls[i];
    element.addEventListener("click", (event) => {
        const target = event.target;
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
    }
    else {
        document.body.requestFullscreen();
        fullScreenEl.setAttribute("class", "fa-solid fa-minimize");
        fullScreenEl.setAttribute("title", "Exit Fullscreen");
    }
});
battleBtnEl.addEventListener("click", menuSelect);
zenBtnEl.addEventListener("click", menuSelect);
toggleColorMode();
if (!document.fullscreenEnabled) {
    fullScreenEl.style.display = "none";
}
