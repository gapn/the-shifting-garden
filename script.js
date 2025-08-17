'use strict';

const hexSizeInPixels = 50;
const timerInSeconds = 10;
const hexRadius = 2;

const plantData = {
    'sunflower': { name: 'Sunflower', cost: 10, points: 5, origin: 'USA 🇺🇸', emoji: '🌻' },
    'lavender': { name: 'Lavender', cost: 15, points: 8, origin: 'France 🇫🇷', emoji: '🪻' },
    'lotus': { name: 'Lotus Flower', cost: 20, points: 12, origin: 'China 🇨🇳', emoji: '🪷' },
};

const gameState = {
    grid: createGridData(hexRadius),
    selectedHexId: null,
    timer: timerInSeconds,
    inventory: [{ ...plantData.sunflower }],
    selectedInventoryIndex: null,
};

// Grid & Hex Logic
function createGridData(sideLengthMinusOne) {
    const gridData = [];
    for (let q = -sideLengthMinusOne; q <= sideLengthMinusOne; q++) {
        for (let r = -sideLengthMinusOne; r <= sideLengthMinusOne; r++) {
            const s = -q -r;
            if (Math.abs(s) <= sideLengthMinusOne) {
                const coordinateId = `${q},${r},${s}`;
                gridData.push({ coordinateId, q, r, s, plant: null });
            }
        }
    }
    return gridData
}

function hexToPixel(hex) {
    const x = 3/2 * hex.q * hexSizeInPixels;
    const y = (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r) * hexSizeInPixels;
    return { x, y };
}

function pixelToHex(x, y) {
    const q = (2 / 3 * x) / hexSizeInPixels;
    const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / hexSizeInPixels;
    return hexRound({q, r, s: -q - r });
}

function hexRound(frac) {
    let q = Math.round(frac.q);
    let r = Math.round(frac.r);
    let s = Math.round(frac.s);
    const q_diff = Math.abs(q - frac.q);
    const r_diff = Math.abs(r - frac.r);
    const s_diff = Math.abs(s - frac.s);

    if (q_diff > r_diff && q_diff > s_diff) {
        q = -r -s;
    } else if (r_diff > s_diff) {
        r = -q -s;
    } else {
        s = -q -r;
    }

    return { q, r, s };
}

function handleHexClick(clickedHex) {
    if (clickedHex) {
        if (gameState.selectedInventoryIndex !== null) {
            const plantToPlace = gameState.inventory[gameState.selectedInventoryIndex];
            clickedHex.plant = { ...plantToPlace };

            gameState.inventory.splice(gameState.selectedInventoryIndex, 1);
            gameState.selectedInventoryIndex = null;

            renderInventory();
            renderGrid();
        } else {
            gameState.selectedHexId = clickedHex.coordinateId;
            renderGrid();
        }
    } else {
        gameState.selectedHexId = null;
        renderGrid();
    }
}

// Rendering
function renderGrid() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    const gridWidth = 5 * Math.sqrt(3) * hexSizeInPixels;
    const gridHeight = 3 * Math.sqrt(3) * hexSizeInPixels + 4 * hexSizeInPixels;
    container.style.width = `${gridWidth}px`;
    container.style.height = `${gridHeight}px`;

    gameState.grid.forEach(hex => {
        const pixel = hexToPixel(hex);
        const tile = document.createElement('div');
        tile.className = 'hex-tile';

        if (hex.coordinateId === gameState.selectedHexId) {
            tile.classList.add('selected-hex');
        }

        if (hex.plant) {
            const plantDiv = document.createElement('div');
            const plantClass = hex.plant.name.toLowerCase().replace(' ', '-');
            plantDiv.className = `plant ${plantClass}`;
            tile.appendChild(plantDiv);
        }

        const offsetLeft = gridWidth / 2;
        const offsetTop = gridHeight / 2;

        tile.style.left = `${pixel.x + offsetLeft}px`;
        tile.style.top = `${pixel.y + offsetTop}px`;
        
        container.appendChild(tile);
    });
}

renderGrid();
renderInventory();

document.getElementById('game-container').addEventListener('click', (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    const coordinates = pixelToHex(x, y);
    
    const clickedHex = gameState.grid.find(h => h.q === coordinates.q && h.r === coordinates.r && h.s === coordinates.s);

    handleHexClick(clickedHex);
});

// Timer
function renderTimer() {
    const timerElement = document.getElementById('timer-display');
    timerElement.textContent = `Time: ${gameState.timer}`
}

function advanceTurn() {
    console.log('A new turn begins');
    gameState.timer = timerInSeconds;
}

function gameLoop() {
    renderTimer();
    gameState.timer--;
    if (gameState.timer < 0) {
        advanceTurn();
    }
}

// Inventory
function renderInventory() {
    const inventoryDisplay = document.getElementById('inventory-display');
    inventoryDisplay.innerHTML = '';

    gameState.inventory.forEach((plant, index) => {
        const plantElement = document.createElement('div');
        plantElement.textContent = plant.name;
        plantElement.className = 'plant-element';

        if (gameState.selectedInventoryIndex === index) {
            plantElement.classList.add('selected-inventory');
        }
        plantElement.addEventListener('click', () => handleInventoryClick(index));
        inventoryDisplay.appendChild(plantElement);
    });
}

function handleInventoryClick(index) {
    gameState.selectedInventoryIndex = index;

    renderInventory();
}



setInterval(gameLoop, 1000);