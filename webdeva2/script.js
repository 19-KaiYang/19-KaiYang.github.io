document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('types-link').addEventListener('click', function() { showMainSection('types'); });
    document.getElementById('what-link').addEventListener('click', function() { showMainSection('what'); });
    document.getElementById('history-link').addEventListener('click', function() { showMainSection('history'); });

    document.getElementById('pringles-button').addEventListener('click', function() { showSpecificContent('pringles', 'img/pringle.jpg'); });
    document.getElementById('lays-button').addEventListener('click', function() { showSpecificContent('lays', 'img/lays.jpg'); });
    document.getElementById('ruffles-button').addEventListener('click', function() { showSpecificContent('ruffles', 'img/ruffles.jpg'); });

    document.getElementById('back-button').addEventListener('click', function() { showMainSection('types'); });

    var flipContainers = document.querySelectorAll('.flip-container');
    flipContainers.forEach(function(container) {
        container.addEventListener('click', function(event) {
            if (!event.target.closest('form') && event.target.tagName !== 'BUTTON') {
                container.classList.toggle('flip');
            }
        });
    });

    showMainSection('types');

    var nutritionData = {
        pringles: { calories: 536, fat: 34, carbs: 52, protein: 4 },
        lays: { calories: 547, fat: 35, carbs: 53, protein: 5 },
        ruffles: { calories: 536, fat: 34, carbs: 52, protein: 4 }
    };

    document.querySelector('#nutrition-form').addEventListener('submit', function(event) {
        event.preventDefault();

        var chipType = document.getElementById('chip-type').value;
        var chipAmount = document.getElementById('chip-amount').value;
        var nutrition = nutritionData[chipType];
        
        var calories = (nutrition.calories * chipAmount / 100).toFixed(2);
        var fat = (nutrition.fat * chipAmount / 100).toFixed(2);
        var carbs = (nutrition.carbs * chipAmount / 100).toFixed(2);
        var protein = (nutrition.protein * chipAmount / 100).toFixed(2);

        document.getElementById('nutrition-result').innerHTML = '<h3>Nutrition Facts for ' + chipAmount + ' grams of ' + chipType.charAt(0).toUpperCase() + chipType.slice(1) + '</h3>' +
            '<p>Calories: ' + calories + ' kcal</p>' +
            '<p>Fat: ' + fat + ' g</p>' +
            '<p>Carbohydrates: ' + carbs + ' g</p>' +
            '<p>Protein: ' + protein + ' g</p>';
    });
});

// Game JavaScript Code
var canvas = document.getElementById('gameCanvas');
var context = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

var chips = [];
var currentChip = null;
var score = 0;
var level = 1;
var moveDirection = 1; // 1 for right, -1 for left
var chipSpeed = 2;
var horizontalSpeed = 2;
var gameOver = false;
var fallingSide = null; 
var fallingAnimationFrame = 0;
var chipHeight = 35; 

// Load Pringles chip image with transparent background
var chipImage = new Image();
chipImage.src = 'img/chip.png'; 

// Define the pillar
var pillar = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 20,
    width: 50,
    height: 20
};

chipImage.onload = function() {
    startGame();
};

function startGame() {
    currentChip = createChip();
    updateGame();
}

function createChip() {
    return {
        x: Math.random() * (canvas.width - 75), 
        y: 0, 
        width: 75, // Adjust chip size
        height: chipHeight,
        falling: false
    };
}

function updateGame() {
    if (gameOver) {
        if (fallingSide) {
            animateFall();
        } else {
            displayGameOver();
        }
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the pillar
    context.fillStyle = 'gray';
    context.fillRect(pillar.x, pillar.y, pillar.width, pillar.height);

    if (currentChip) {
        if (currentChip.falling) {
            currentChip.y += chipSpeed;

            if (currentChip.y + currentChip.height >= canvas.height || checkCollision()) {
                if (!isChipOnPillarOrChips(currentChip) || !isStackStable()) {
                    determineFallingSide();
                    gameOver = true;
                } else {
                    // Adjust the vertical position to minimize the gap
                    if (chips.length > 0) {
                        currentChip.y = chips[chips.length - 1].y - (currentChip.height * 0.8);
                    } else {
                        currentChip.y = pillar.y - currentChip.height; 
                    }
                    chips.push(currentChip);
                    currentChip = createChip();
                    score++;
                    document.getElementById('score').innerText = 'Score: ' + score;
                    
                    // Increase horizontal speed with each successful chip placement
                    horizontalSpeed += 0.2;

                    // Win condition: if 17 chips are stacked
                    if (score >= 17) {
                        displayWin();
                        return;
                    }
                }
            }
        } else {
            currentChip.x += moveDirection * horizontalSpeed;

            if (currentChip.x <= 0 || currentChip.x + currentChip.width >= canvas.width) {
                moveDirection *= -1;
            }
        }

        context.drawImage(chipImage, currentChip.x, currentChip.y, currentChip.width, currentChip.height);
    }

    for (var i = 0; i < chips.length; i++) {
        var chip = chips[i];
        context.drawImage(chipImage, chip.x, chip.y, chip.width, chip.height);
    }

    requestAnimationFrame(updateGame);
}

function checkCollision() {
    if (
        currentChip.y + currentChip.height >= pillar.y &&
        currentChip.x < pillar.x + pillar.width &&
        currentChip.x + currentChip.width > pillar.x
    ) {
        return true;
    }

    for (var i = 0; i < chips.length; i++) {
        var chip = chips[i];
        if (
            currentChip.y + currentChip.height >= chip.y &&
            currentChip.x < chip.x + chip.width &&
            currentChip.x + currentChip.width > chip.x
        ) {
            return true;
        }
    }
    return false;
}

function isChipOnPillarOrChips(chip) {
    if (
        chip.y + chip.height >= pillar.y &&
        chip.x < pillar.x + pillar.width &&
        chip.x + chip.width > pillar.x
    ) {
        return true;
    }

    for (var i = 0; i < chips.length; i++) {
        var existingChip = chips[i];
        if (
            chip.y + chip.height >= existingChip.y &&
            chip.x < existingChip.x + existingChip.width &&
            chip.x + chip.width > existingChip.x
        ) {
            return true;
        }
    }
    return false;
}

function isStackStable() {
    if (chips.length < 1) return true; // Only the first chip is always stable

    var lastChip = chips[chips.length - 1];
    var overlap = Math.min(currentChip.x + currentChip.width, lastChip.x + lastChip.width) -
                  Math.max(currentChip.x, lastChip.x);

    return overlap >= currentChip.width * 0.5; // Overlap 50% to be considered stable
}

function determineFallingSide() {
    if (currentChip.x + currentChip.width / 2 < pillar.x + pillar.width / 2) {
        fallingSide = 'left';
    } else {
        fallingSide = 'right';
    }
}

function animateFall() {
    fallingAnimationFrame++;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'gray';
    context.fillRect(pillar.x, pillar.y, pillar.width, pillar.height);

    for (var i = 0; i < chips.length; i++) {
        var chip = chips[i];
        context.save();
        context.translate(chip.x + chip.width / 2, chip.y + chip.height / 2);
        var angle = (fallingSide === 'left' ? -1 : 1) * Math.min(fallingAnimationFrame / 30, 1) * Math.PI / 2;
        context.rotate(angle);
        context.translate(-(chip.x + chip.width / 2), -(chip.y + chip.height / 2));
        context.drawImage(chipImage, chip.x, chip.y, chip.width, chip.height);
        context.restore();

        chip.y += fallingAnimationFrame / 5;
    }

    if (fallingAnimationFrame < 60) {
        requestAnimationFrame(animateFall);
    } else {
        displayGameOver();
    }
}

function displayGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText('Game Over', canvas.width / 2, canvas.height / 2);

    context.font = '24px Arial';
    context.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 50);

    document.getElementById('score').style.display = 'none';
}

function displayWin() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText('You Win!', canvas.width / 2, canvas.height / 2);

    context.font = '24px Arial';
    context.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 50);

    document.getElementById('score').style.display = 'none';
}

canvas.addEventListener('click', function() {
    if (gameOver) {
        restartGame();
    } else if (!currentChip.falling) {
        currentChip.falling = true;
    }
});

function restartGame() {
    gameOver = false;
    fallingSide = null;
    fallingAnimationFrame = 0;
    score = 0;
    level = 1;
    chipSpeed = 2;
    horizontalSpeed = 2; // For Speed 
    chips = [];
    document.getElementById('score').innerText = 'Score: ' + score;
    document.getElementById('score').style.display = 'block';
    startGame();
}

startGame();

function showSpecificContent(contentId, imgSrc) {
    console.log("Showing specific content:", contentId);

    var allCircles = document.querySelectorAll('.circle-container');
    allCircles.forEach(function(circle) {
        var circleContent = circle.querySelector('.circle-content');
        circleContent.classList.remove('show');
        circleContent.classList.add('hide');
        setTimeout(function() {
            circle.style.display = 'none';
        }, 500); // Delay for fading out
    });

    setTimeout(function() {
        var selectedContentContainer = document.getElementById('content-container');
        selectedContentContainer.style.display = 'block';

        var allContentSections = document.querySelectorAll('.content-section');
        allContentSections.forEach(function(content) {
            content.style.display = 'none';
            content.classList.remove('show');
        });

        var selectedContent = document.getElementById(contentId);
        if (selectedContent) {
            selectedContent.style.display = 'block';
            selectedContent.classList.remove('hide');
           
            void selectedContent.offsetWidth;
            selectedContent.classList.add('show');
        } else {
            console.log("Selected content not found:", contentId);
        }

        var contentImage = document.getElementById('content-image');
        if (contentImage) {
            contentImage.src = imgSrc;
            contentImage.classList.remove('hide');
      
            void contentImage.offsetWidth;
            contentImage.classList.add('show');
        } else {
            console.log("Content image not found");
        }

        var backButton = document.getElementById('back-button');
        backButton.style.display = 'block';
    }, 500); 
}

function showMainSection(sectionId) {
    console.log("Showing main section:", sectionId);

    var mainSections = document.querySelectorAll('.main-section');
    mainSections.forEach(function(section) {
        section.style.display = 'none';
    });

    var selectedMainSection = document.getElementById(sectionId);
    if (selectedMainSection) {
        selectedMainSection.style.display = 'block';
    } else {
        console.log("Selected main section not found:", sectionId);
    }

    var imageCircles = document.querySelector('.image-circles');
    if (sectionId === 'what' || sectionId === 'history') {
        imageCircles.style.display = 'none';
    } else {
        imageCircles.style.display = 'flex';
        imageCircles.classList.remove('slide-in-left'); 
        void imageCircles.offsetWidth; 
        imageCircles.classList.add('slide-in-left'); 

        var allCircles = document.querySelectorAll('.circle-container');
        allCircles.forEach(function(circle) {
            circle.style.display = 'flex';
            var circleContent = circle.querySelector('.circle-content');
            circleContent.classList.remove('hide');
            setTimeout(function() {
                circleContent.classList.add('show');
            }, 10);
        });

        var allContentSections = document.querySelectorAll('.content-section, .new-content-section');
        allContentSections.forEach(function(content) {
            content.style.display = 'none';
            content.classList.remove('show');
        });

        var backButton = document.getElementById('back-button');
        backButton.style.display = 'none';
    }

    var selectedContentContainer = document.getElementById('content-container');
    selectedContentContainer.style.display = 'none';

    var contentImage = document.getElementById('content-image');
    contentImage.classList.remove('show');
    contentImage.classList.add('hide');
}
