// Interfaces
interface Coordinates {
    x: number;
    y: number;
}

// HTML Elements
const addBtnEl = document.getElementById("add") as HTMLElement;
const colorModeBtnEl = document.getElementById("color-mode") as HTMLElement;
const settingsBoxEl = document.querySelector(".settings") as HTMLElement;

// Game Variables
const emojiSizes: Coordinates = {x: 55, y: 53};
const windowMax: Coordinates = {x: window.innerWidth - emojiSizes.x, y: window.innerHeight - emojiSizes.y};
let darkMode = localStorage.getItem("color-mode") === "true";
let elementArray: FloatingElement[] = [];

// Element Class
class FloatingElement {
    id: number;
    htmlElement: HTMLSpanElement;
    coordinates: Coordinates;
    increments: Coordinates;
    emoji: string;
    speed: number;

    constructor(id: number, emoji: string) {
        this.id = id;
        this.htmlElement = document.createElement("span");
        // Make Coordinates and Increments randomized
        this.coordinates = {x: 0, y: 0};
        this.increments = {x: 1, y: 1};
        this.emoji = emoji;
        this.speed = 10;
    }

    init() {
        // Add to array of FloatingElements
        elementArray.push(this);

        // Update DOM
        this.htmlElement.innerText = this.emoji;
        this.updateDOM();
        document.body.appendChild(this.htmlElement);

        // Start Movement
        return setInterval(() => this.movementInterval(), this.speed)
    }

    updateDOM() {
        this.htmlElement.setAttribute("style", `left: ${this.coordinates.x}px; top: ${this.coordinates.y}px`);
    }

    movementInterval() {
        this.coordinates = {x: this.coordinates.x + this.increments.x, y: this.coordinates.y + this.increments.y}
        return this.updateDOM();
    }

    wallBump(isHorizontal: boolean) {
        const indexString = isHorizontal ? "x" : "y";
        const newCoordinate = this.coordinates[indexString] + this.increments[indexString];

        return newCoordinate > windowMax[indexString] || newCoordinate < 0;
    }
}


// Helper Functions
const toggleColorMode = () => {
    localStorage.setItem("color-mode", darkMode.toString());
    document.body.style.backgroundColor = darkMode ? "#0a0e12" : "white";
    settingsBoxEl.style.color = darkMode ? "white" : "black";
    colorModeBtnEl.setAttribute("class", `fa-solid fa-${darkMode ? "sun" : "moon"}`)
}

// Event Listeners
addBtnEl.addEventListener("click", () => {
    // Update to allow user to select which emoji(s) and the quantity they want to add.
    return new FloatingElement(elementArray.length, "🪨").init();
});
colorModeBtnEl.addEventListener("click", () => {
    darkMode = !darkMode;
    return toggleColorMode();
});