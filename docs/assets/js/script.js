"use strict";
const addBtnEl = document.getElementById("add");
const colorModeBtnEl = document.getElementById("color-mode");
const settingsBoxEl = document.querySelector(".settings");
const emojiSizes = { x: 55, y: 53 };
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
        this.coordinates = { x: 0, y: 0 };
        this.increments = { x: 1, y: 1 };
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
        this.coordinates = { x: this.coordinates.x + this.increments.x, y: this.coordinates.y + this.increments.y };
        return this.updateDOM();
    }
}
const toggleColorMode = () => {
    localStorage.setItem("color-mode", darkMode.toString());
    document.body.style.backgroundColor = darkMode ? "#0a0e12" : "white";
    settingsBoxEl.style.color = darkMode ? "white" : "black";
    colorModeBtnEl.setAttribute("class", `fa-solid fa-${darkMode ? "sun" : "moon"}`);
};
addBtnEl.addEventListener("click", () => {
    return new FloatingElement(elementArray.length, "🪨").init();
});
colorModeBtnEl.addEventListener("click", () => {
    darkMode = !darkMode;
    return toggleColorMode();
});
