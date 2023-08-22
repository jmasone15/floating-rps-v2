"use strict";
const addBtnEl = document.getElementById("add");
const colorModeBtnEl = document.getElementById("color-mode");
const settingsBoxEl = document.querySelector(".settings");
const emojiSizes = { x: 55, y: 53 };
const windowMax = {
    x: window.innerWidth - emojiSizes.x,
    y: window.innerHeight - emojiSizes.y
};
let darkMode = localStorage.getItem("color-mode") === "true";
let elementArray = [];
class FloatingElement {
    id;
    htmlElement;
    coordinates;
    increments;
    emoji;
    speed;
    constructor(id, emoji) {
        this.id = id;
        this.htmlElement = document.createElement("span");
        this.coordinates = { x: randomNumber(0, windowMax.x), y: randomNumber(0, windowMax.y) };
        this.increments = { x: coinFlip(-1, 1), y: coinFlip(-1, 1) };
        this.emoji = emoji;
        this.speed = 10;
    }
    init() {
        elementArray.push(this);
        this.htmlElement.innerText = this.emoji;
        this.updateDOM();
        document.body.appendChild(this.htmlElement);
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
    moveElement() {
        this.coordinates = {
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
    shapeBump() {
        const { left, right, top, bottom } = this.htmlElement.getBoundingClientRect();
        for (let i = 0; i < elementArray.length; i++) {
            if (this.id !== elementArray[i].id) {
                const elementCoords = elementArray[i].htmlElement.getBoundingClientRect();
                if (comparePositions([left, right], [elementCoords.left, elementCoords.right]) &&
                    comparePositions([top, bottom], [elementCoords.top, elementCoords.bottom])) {
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
}
const toggleColorMode = () => {
    localStorage.setItem("color-mode", darkMode.toString());
    document.body.style.backgroundColor = darkMode ? "#0a0e12" : "white";
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
addBtnEl.addEventListener("click", () => {
    if (elementArray.length > 1) {
        console.log("test");
        elementArray[0].shapeBump();
    }
    return new FloatingElement(elementArray.length, "🪨").init();
});
colorModeBtnEl.addEventListener("click", () => {
    darkMode = !darkMode;
    return toggleColorMode();
});
