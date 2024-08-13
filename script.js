let words = [
    "Well...", "DENIAL", "ANGER", "HIV doesn't kill. What kills, most, is the stigma", "FRUSTRATION",
    "It is better to test than being sorry", "NEED for SUPPORT", "my HIV...", "ISOLATION",
    "HIV doesn't kill. What kills, most, is the stigma", "NEED FOR AWARENESS", "...something that I can't share",
    "double life is a killer", "DISCRIMINATION", "silence kills", "...I'm not free to talk about it",
    "That's stigma for me...", "First, the virus didn't kill us", "NEED FOR UNDERSTANDING", "MISTRUST"
];

let wordPositions = [];

function setup() {
    let canvas = createCanvas(800, 600); // Set canvas size to 800x600 pixels
    canvas.parent('p5-container'); // Attach the canvas to the p5-container div
    background(255);
    textSize(15);
    textAlign(CENTER, CENTER);
    fill(0);
    textFont('Courier New'); // Use Courier New font

    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let textWidthValue = textWidth(word + ' ');
        let x = random(textWidthValue / 2, width - textWidthValue / 2); // Random x position ensuring word is fully visible
        let y = random(height); // Completely random y position within the canvas
        let speed = isUpperCase(word) ? random(0.5, 2) : random(0.1, 1);
        wordPositions.push({ word: word, x: x, y: y, speed: speed });
    }
}

function draw() {
    background(255);
    for (let i = 0; i < wordPositions.length; i++) {
        let pos = wordPositions[i];
        pos.y += pos.speed; // Update position based on speed
        if (pos.y > height) { // Wrap around if it goes off-screen
            pos.y = 0;
            pos.x = random(textWidth(pos.word + ' ') / 2, width - textWidth(pos.word + ' ') / 2); // Reset x position ensuring word is fully visible
        }
        text(pos.word, pos.x, pos.y);
    }
}

function isUpperCase(word) {
    return word === word.toUpperCase();
}

console.log("script is linked and running!");
