//variables

//general
var solved = document.querySelector(".puzzle-board-image--solved");
var startButton = document.querySelector(".left-section__start-button");
var hintButton = document.querySelector(".left-section__hint-button");
var buttonWrapper = document.querySelector(".button-wrapper");
var timerElement = document.querySelector(".left-section__timer-container__timer");
var timerContainer = document.querySelector(".left-section__timer-container");
var endMessage = document.querySelector(".out-of-time-message");
var puzzleBoard = document.querySelector(".puzzle-board-container");
var loseOverlay = document.querySelector(".puzzle-board-container__lose-overlay");
var difficultyContainer = document.querySelector(".increase-difficulty-container");
var difficultyButton = document.querySelector(".increase-difficulty-container button");
var winSound = new Audio("./hexagon_puzzle-assets/win-sound.mp3");
var loseSound = new Audio("./hexagon_puzzle-assets/lose-sound.mp3");
var placeholderText = document.querySelector(".start-positions-container__placeholder");
var piecesGrid = document.querySelector(".start-positions-container-grid");
var hintCounter = 3;
var secondsReset = 600;
var seconds = 600;
var counter;
var started = false;
var lost;
var victoryCounter;
var victory = false;

//puzzle pieces
var puzzlePieceContainers = document.querySelectorAll(".puzzle-piece-start-container");
var puzzlePieces = document.querySelectorAll(".puzzle-piece");
var puzzleBoardSpaces = document.querySelectorAll("div[class^='puzzle-board-space-']");
var startingContainerGrid = document.querySelector(".start-positions-container-grid");
var puzzlePiecesInPlace = 0;
var puzzlePieceContainersArray = [];
var puzzlePositions = [];
var startPositions = [];
var pieceID;

function makeArrayOfNumbers(numberOfItems) {
    "use strict";
    var array = [];
    for(var i = 1; i <= numberOfItems; i++) {
        array.push(i);
    }
    return array;
}

var numberArray = makeArrayOfNumbers(41);
var numberArrayShuffled = numberArray.slice();
//shuffle
function shuffle(array) {
  "use strict";
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var numberArrayShuffled = shuffle(numberArrayShuffled);




//handlers

//start and reset
startButton.addEventListener("click", function(event) {
    "use strict";
    this.textContent = "Restart";

    //hide placeholder
    placeholderText.classList.add("placeholder-hidden");

    if(!started) {
        started = true;
        solved.classList.toggle("solved-image-hidden");

        timerContainer.classList.add("timer-container-expanded");
        buttonWrapper.classList.add("button-wrapper-expanded");
        hintButton.textContent += " (" + hintCounter + " remaining)";
        // countDown(seconds);

        //start timer
        timerElement.textContent = "Go!";
        counter = setInterval(function() {
            // console.log("firing interval callback");
            countDown();
        }, 1000);

        //animate puzzle pieces
        puzzlePiecesIntroTimeline.staggerTo(puzzlePieceContainers, .3, {
            className: "-=puzzle-piece-hidden"
        }, .03);

        difficultyContainer.classList.remove("difficulty-container-hidden");

    } else {
        resetEverything();
    }
});


//hints
hintButton.addEventListener("mousedown", function(event) {
    "use strict";
    hintCounter--;
    this.textContent = "Click and hold to show hint " + "(" + hintCounter + " remaining)";
    solved.classList.remove("solved-image-hidden");
    if(hintCounter === 0) {
        this.textContent = "No more hints";
    }
});

hintButton.addEventListener("mouseup", function(event) {
    "use strict";
    solved.classList.add("solved-image-hidden");
    if(hintCounter === 0) {
        this.classList.add("disabled-button");
    }
});

//increase difficulty - hide hint button and take 20% off clock
difficultyButton.addEventListener("click", function(event) {
    "use strict";
    this.parentNode.style.transitionDelay = ".3s";
    this.parentNode.classList.add("difficulty-container-hidden");
    //take time off clock
    clearInterval(counter);
    seconds = Math.floor(seconds * .80);
    counter = setInterval(function() {
        // console.log("firing interval callback");
        countDown();
    }, 1000);
    //hide hint button
    buttonWrapper.classList.remove("button-wrapper-expanded");
});





//timer
// var counter = setInterval(countDown.bind(null, seconds), 1000);
function countDown() {
    "use strict";
    //variables
    // console.log(seconds);
    if(seconds === 0) {
        timerElement.textContent = seconds;
        endMessage.classList.add("out-of-time-expanded");
        clearInterval(counter);
        endMessage.textContent = "You are out of time. Click 'Restart' to try again.";
        loseOverlay.classList.remove("lose-overlay--inactive");
        difficultyContainer.classList.add("difficulty-container-hidden");
        loseSound.play();
        return true;
    }
    timerElement.textContent = seconds;
    seconds--;
}




//loop through puzzle piece containers and assign CSS order properties from random number array
for(var i = 0; i < puzzlePieceContainers.length; i++) {
    puzzlePieceContainers[i].style.order = numberArrayShuffled[i];
}




//drag and drop functions
function allowDrop(event) {
    "use strict";
    event.preventDefault();
}

// function drag(event) {
//     event.dataTransfer.setData("text", event.target.id);
// }

function drag(event) {
    "use strict";
    pieceID = event.target.dataset.puzzleId;
    event.dataTransfer.setData("text", pieceID);
}


function drop(event) {
    "use strict";
    if((event.target.tagName === "DIV") && (!event.target.hasChildNodes())) {
        event.preventDefault();

        // //move piece
        var data = event.dataTransfer.getData("text");
        var elementID = "piece-" + data;
        var pieceToMove = document.getElementById(elementID);
        console.log(pieceToMove);
        pieceToMove.parentNode.style.order = 1000;
        event.target.appendChild(document.getElementById(elementID));

        // //check to see if puzzle is complete
        victoryCounter = 0;
        puzzleBoardSpaces.forEach(function(item) {
            if(item.hasChildNodes()) {
                if(item.id.split("-")[1] === item.firstElementChild.id.split("-")[1]) {
                    victoryCounter++;
                }
            }
        });

        console.log(victoryCounter);

        //add puzzle pieces to inplace array
        puzzlePiecesInPlace = document.querySelectorAll("div[class^='puzzle-board-space'] img.puzzle-piece");


        //set victory to true and animate
        if(victoryCounter === 41) {
            winSound.play();
            setTimeout(function() {
                //set victory to true
                victory = true;

                //animate pieces

                victoryTimeline.staggerTo(puzzlePiecesInPlace, .2, {
                    className: "+=win-rotation"
                }, .03);


                //stop timer
                clearInterval(counter);
                endMessage.textContent = "You did it! Congratulations!";
                endMessage.classList.add("out-of-time-expanded");

                //hide hint button
                victoryTimeline.to(buttonWrapper, .2, {
                    className: "-=button-wrapper-expanded"
                });

                //hide difficulty button
                victoryTimeline.to(difficultyContainer, .2, {
                    className: "+=difficulty-container-hidden"
                }, "-=.6")

            }, 800)
        }
    } else {
        console.log(event.target);
        console.log("you cannot drop here");
    }
}



//resetFunction
function resetEverything() {
    "use strict";
    //stop timer and reset
    clearInterval(counter);
    seconds = secondsReset;
    counter = setInterval(function() {
        // console.log("firing interval callback");
        countDown();
    }, 1000);

    //hide board and bottom pieces
    resetTimeline.to(solved, .3, {
        className: "-=solved-image-hidden"
    });
    if(puzzlePiecesInPlace.length > 0) {
        resetTimeline.to(puzzlePiecesInPlace, .01, {
            className: "-=win-rotation"
        });
    }
    // solved.classList.remove("solved-image-hidden");
    resetTimeline.to(startingContainerGrid, .3, {
        className: "+=bottom-pieces-hidden"
    }, "-=.1");
    // startingContainerGrid.classList.add("bottom-pieces-hidden");

    //move images back to bottom containers
    resetTimeline.add(function() {
        for(var j = 0; j < puzzlePieceContainers.length; j++) {
            var imageID = "piece-" + (j + 1);
            puzzlePieceContainers[j].appendChild(document.getElementById(imageID));
        }
    });
    //show board and bottom pieces
    resetTimeline.to(solved, .3, {
        className: "+=solved-image-hidden"
    });
    // solved.classList.remove("solved-image-hidden");
    resetTimeline.to(startingContainerGrid, .3, {
        className: "-=bottom-pieces-hidden"
    }, "-=.1");

    loseOverlay.classList.add("lose-overlay--inactive");
    //show board and bottom pieces
    // solved.classList.add("solved-image-hidden");
    // startingContainerGrid.classList.add("bottom-pieces-hidden");
    //show hint button
    hintCounter = 3;
    hintButton.textContent = "Click and hold to show hint " + "(" + hintCounter + " remaining)";
    hintButton.classList.remove("disabled-button");
    endMessage.classList.remove("out-of-time-expanded");
    resetTimeline.to(buttonWrapper, .2, {
        className: "+=button-wrapper-expanded"
    }, "-=.2");
    resetTimeline.to(difficultyContainer, .2, {
        className: "-=difficulty-container-hidden"
    }, "-=.2");
}



//win immediately function
function winNow() {
    "use strict";
    for(var i = 0; i < puzzleBoardSpaces.length - 1; i++) {
        var imageID = "piece-" + puzzleBoardSpaces[i].id.split("-")[1];
        puzzleBoardSpaces[i].appendChild(document.getElementById(imageID));
    }
}


//animations
var puzzlePiecesIntroTimeline = new TimelineMax();
var resetTimeline = new TimelineMax();
var victoryTimeline = new TimelineMax();

window.addEventListener("load", function(event) {
    puzzleBoard.classList.remove("load-hidden");
});

