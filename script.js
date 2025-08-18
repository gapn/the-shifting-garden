'use strict';

const translations = {
    en: {
        plant_sunflower_name: 'Sunflower',
        plant_lavender_name: 'Lavender',
        plant_shadow_fern_name: 'Shadow Fern',
        plant_carniolan_lily_name: 'Carniolan Lily',
        plant_bird_of_paradise_name: 'Bird of Paradise',
        plant_kangaroo_paw_name: 'Kangaroo Paw',
        ui_score: 'Score',
        ui_time: 'Time',
        ui_turn: 'Turn',
        ui_shop: 'Shop',
        ui_inventory: 'Inventory',
        ui_game_title: 'The Shifting Garden',
        ui_game_subtitle: 'Place plants to score points. The sun moves every 10 seconds!',
        shop_cost: 'Cost',
        game_over_title: 'Game Over!',
        game_over_score: 'Final Score',
        btn_start: 'Start Game',
        btn_play_again: 'Play Again?',
    },
    sl: {
        plant_sunflower_name: 'Sončnica',
        plant_lavender_name: 'Sivka',
        plant_shadow_fern_name: 'Senčna Praprot',
        plant_carniolan_lily_name: 'Kranjska Lilija',
        plant_bird_of_paradise_name: 'Rajska Ptica',
        plant_kangaroo_paw_name: 'Kengurujeva Tačka',
        ui_score: 'Točke',
        ui_time: 'Čas',
        ui_turn: 'Krog',
        ui_shop: 'Trgovina',
        ui_inventory: 'Inventar',
        ui_game_title: 'Premikajoči se vrt',
        ui_game_subtitle: 'Postavljaj rastline za točke. Sonce se premakne vsakih 10 sekund!',
        shop_cost: 'Cena',
        game_over_title: 'Konec igre!',
        game_over_score: 'Končni rezultat',
        btn_start: 'Začni igro',
        btn_play_again: 'Igraj ponovno?',
    },
    es: {
        plant_sunflower_name: 'Girasol',
        plant_lavender_name: 'Lavanda',
        plant_shadow_fern_name: 'Helecho de Sombra',
        plant_carniolan_lily_name: 'Lirio de Carniola',
        plant_bird_of_paradise_name: 'Ave del Paraíso',
        plant_kangaroo_paw_name: 'Pata de Canguro',
        ui_score: 'Puntuación',
        ui_time: 'Tiempo',
        ui_turn: 'Turno',
        ui_shop: 'Tienda',
        ui_inventory: 'Inventario',
        ui_game_title: 'El Jardín Cambiante',
        ui_game_subtitle: 'Coloca plantas para ganar puntos. ¡El sol se mueve cada 10 segundos!',
        shop_cost: 'Coste',
        game_over_title: '¡Juego terminado!',
        game_over_score: 'Puntuación final',
        btn_start: 'Empezar juego',
        btn_play_again: '¿Jugar de nuevo?',
    }
};

const i18n = {};

function setLanguage(lang) {
    if (translations[lang]) {
        Object.assign(i18n, translations[lang]);
        console.log(`Language set to: ${lang}`);
    } else {
        console.error(`Language not found: ${lang}`);
    }
}

const hexSizeInPixels = 50;
const timerInSeconds = 10;
const hexRadius = 2;
const container = document.getElementById('game-container');
let gameInterval = null;

const plantData = {
    'sunflower': { nameKey: 'plant_sunflower_name', type: 'sunflower', cost: 10, points: 5, emoji: '🌻', height: 2, lightNeed: 3, flag: '🇺🇸' },
    'lavender': { nameKey: 'plant_lavender_name', type: 'lavender', cost: 15, points: 8, emoji: '🪻', height: 1, lightNeed: 3, flag: '🇫🇷' },
    'shadow-fern': { nameKey: 'plant_shadow_fern_name', type: 'shadow-fern', cost: 20, points: 12, emoji: '🌿', height: 1, lightNeed: 1, flag: '🇯🇵' },
    'carniolan-lily': { nameKey: 'plant_carniolan_lily_name', type: 'carniolan-lily', cost: 25, points: 15, emoji: '🧡', height: 1, lightNeed: 2, flag: '🇸🇮' },
    'bird-of-paradise': { nameKey: 'plant_bird_of_paradise_name', type: 'bird-of-paradise', cost: 30, points: 18, emoji: '🌺', height: 2, lightNeed: 3, flag: '🇿🇦' },
    'kangaroo-paw': { nameKey: 'plant_kangaroo_paw_name', type: 'kangaroo-paw', cost: 15, points: 7, emoji: '🐾', height: 1, lightNeed: 3, flag: '🇦🇺' },
};

const sunPositions = [
    { q: 10, r: 0, s: -10 }, { q: 0, r: 10, s: -10 }, { q: -10, r: 10, s: 0 },
    { q: -10, r: 0, s: 10 }, { q: 0, r: -10, s: 10 }, { q: 10, r: -10, s: 0 },
];

const lightLevels = { sun: 3, shadow: 1 };

const gameState = {
    grid: createGridData(hexRadius),
    selectedHexId: null,
    timer: timerInSeconds,
    score: 25,
    inventory: [{ ...plantData["carniolan-lily"] }],
    selectedInventoryIndex: null,
    sunPositionIndex: 0,
    turn: 0,
    maxTurns: 18,
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

            calculateLightLevels();
            renderAll();
        } else {
            gameState.selectedHexId = clickedHex.coordinateId;
            renderAll();
        }
    } else {
        gameState.selectedHexId = null;
        renderAll();
    }
}

function hexDistance(a, b) {
    return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

function hexLinearInterpolation(a, b, t) {
    return { q: a.q * (1 - t) + b.q * t, r: a.r * (1 - t) + b.r * t, s: a.s * (1 - t) + b.s * t };
}

function hexLineDraw(a, b) {
    const dist = hexDistance(a, b);
    const results = [];
    if (dist === 0) return [a];
    for (let i = 0; i <= dist; i++) {
        results.push(hexRound(hexLinearInterpolation(a, b, (1.0 / dist) * i)));
    }
    return results;
}

// Shadows
function calculateLightLevels() {
    gameState.grid.forEach(hex => hex.lightLevel = lightLevels.sun);
    const sunPos = sunPositions[gameState.sunPositionIndex];
    
    gameState.grid.forEach(tile => {
        const lineToSun = hexLineDraw(tile, sunPos);
        for (const hexOnLine of lineToSun) {
            const gridHex = gameState.grid.find(h => h.coordinateId === `${hexOnLine.q},${hexOnLine.r},${hexOnLine.s}`);

            if (gridHex && gridHex.plant && gridHex.coordinateId !== tile.coordinateId) {
                if (gridHex.plant.height >= tile.plant?.height || !tile.plant) {
                    tile.lightLevel = lightLevels.shadow;
                    break;
                }
            }
        }
    });
}

// Rendering
function renderGrid() {
    container.innerHTML = '';

    const sunIndicator = document.createElement('div');
    sunIndicator.id = 'sun-indicator';
    sunIndicator.textContent = '☀️';
    container.appendChild(sunIndicator);

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
            const plantClass = i18n[hex.plant.nameKey].toLowerCase().replace(' ', '-');
            plantDiv.className = `plant ${plantClass}`;
            plantDiv.textContent = hex.plant.emoji;
            tile.appendChild(plantDiv);
        }

        if (hex.lightLevel === lightLevels.shadow) {
            tile.classList.add('shadow');
        }

        const offsetLeft = gridWidth / 2;
        const offsetTop = gridHeight / 2;

        tile.style.left = `${pixel.x + offsetLeft}px`;
        tile.style.top = `${pixel.y + offsetTop}px`;
        
        container.appendChild(tile);
    });
}

function renderSun() {
    const sunIndicator = document.getElementById('sun-indicator');
    const sunPos = sunPositions[gameState.sunPositionIndex];
    const sunPixelPos = hexToPixel(sunPos);
    const magnitude = Math.sqrt(sunPixelPos.x ** 2 + sunPixelPos.y ** 2);
    const boardRadius = (container.offsetWidth / 2) * 0.9; 
    const sunX = (sunPixelPos.x / magnitude) * boardRadius;
    const sunY = (sunPixelPos.y / magnitude) * boardRadius;

    sunIndicator.style.left = `${sunX + container.offsetWidth / 2}px`;
    sunIndicator.style.top = `${sunY + container.offsetHeight / 2}px`;
}

function renderAll() {
    renderGrid();
    renderInventory();
    renderShop();
    renderUI();
    renderSun();
}

changeLanguage('en');
calculateLightLevels();
renderAll();

document.getElementById('game-container').addEventListener('click', (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    const coordinates = pixelToHex(x, y);
    
    const clickedHex = gameState.grid.find(h => h.q === coordinates.q && h.r === coordinates.r && h.s === coordinates.s);

    handleHexClick(clickedHex);
});

// UI
function renderUI() {
    const scoreElement = document.getElementById('score-display');
    const timerElement = document.getElementById('timer-display');
    const turnElement = document.getElementById('turn-display');

    const currentRevolution = Math.floor(gameState.turn / sunPositions.length) + 1;
    
    scoreElement.textContent = `${i18n.ui_score}: ${gameState.score}`;
    timerElement.textContent = `${i18n.ui_time}: ${gameState.timer}`;
    turnElement.textContent = `${i18n.ui_turn}: ${currentRevolution} / 3`;
}

function advanceTurn() {
    gameState.turn++;
    console.log('A new turn begins');
    if (gameState.turn > gameState.maxTurns) {
        clearInterval(gameInterval)
        alert(`${game_over_score} ${game_over_score}: ${gameState.score}`);
        return;
    }

    gameState.sunPositionIndex = (gameState.sunPositionIndex + 1) % sunPositions.length;
    calculateLightLevels();
    calculateScore();
    gameState.timer = timerInSeconds;
    renderAll();
}

function gameLoop() {
    gameState.timer--;
    if (gameState.timer < 0) {
        advanceTurn();
    }
    renderUI();
}

function calculateScore() {
    let turnScore = 0;
    gameState.grid.forEach(hex => {
        if (hex.plant) {
            if (hex.lightLevel >= hex.plant.lightNeed) {
                turnScore += hex.plant.points;
            }
        }
    });
    console.log(`Scored ${turnScore} points this turn.`);
    gameState.score += turnScore;
}

function initializeUI() {
    document.querySelector('h1').textContent = i18n.ui_game_title;
    // Assumes you have a <p> tag for the subtitle
    const subtitleElement = document.querySelector('p');
    if (subtitleElement) {
        subtitleElement.textContent = i18n.ui_game_subtitle;
    }
    
    // Selects the <h2> inside each container
    document.querySelector('#shop-container h2').textContent = i18n.ui_shop;
    document.querySelector('#inventory-container h2').textContent = i18n.ui_inventory;
}

// Inventory & Shop
function renderInventory() {
    const inventoryDisplay = document.getElementById('inventory-display');
    inventoryDisplay.innerHTML = '';

    gameState.inventory.forEach((plant, index) => {
        const plantElement = document.createElement('div');
        plantElement.textContent = `${plant.emoji} ${i18n[plant.nameKey]} ${plant.flag}`;
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

function handleBuyPlant(plantType) {
    const plant = plantData[plantType];
    if (gameState.score >= plant.cost) {
        gameState.score -= plant.cost;
        gameState.inventory.push({ ...plant });

        renderShop();
        renderInventory();
        renderUI();
    } else {
        alert('not enough points')
    }
}

function renderShop() {
    const shopDisplay = document.getElementById('shop-display');
    shopDisplay.innerHTML = '';
    for (const plantType in plantData) {
        const plant = plantData[plantType];
        const plantElement = document.createElement('div');
        plantElement.className = 'shop-item';
        plantElement.textContent = `${plant.emoji} ${i18n[plant.nameKey]} ${plant.flag} (${i18n.shop_cost}: ${plant.cost})`;

        if (gameState.score <plant.cost) {
            plantElement.classList.add('disabled');
        } else {
            plantElement.addEventListener('click', () => handleBuyPlant(plantType));
        }

        shopDisplay.appendChild(plantElement);
    }
}

// This new function handles the entire language change process
function changeLanguage(lang) {
    setLanguage(lang);
    initializeUI();
    renderAll(); // Re-render dynamic components like shop and inventory

    // Update the active button style
    document.querySelectorAll('#lang-switcher button').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Add this event listener to the bottom of your script
document.getElementById('lang-switcher').addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const lang = event.target.dataset.lang;
        changeLanguage(lang);
    }
});

gameInterval = setInterval(gameLoop, 1000);