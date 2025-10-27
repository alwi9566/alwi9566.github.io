let dealBtn = document.querySelector("#deal-btn");
let hitBtn = document.querySelector("#hit-btn");
let standBtn = document.querySelector("#stand-btn");

dealBtn.addEventListener('click', dealGame);
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);

let gameState = {
    deckId: "",
    playerHand: [],
    dealerHand: [],
    gameOver: false
}

async function dealGame() {
    try {
        const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6");
        if (!response.ok) {
            throw Error(response.statusText);
        }
        const json = await response.json();
        console.log("New Deck Response:", json);
        gameState.deckId = json.deck_id;
        gameState.playerHand = [];
        gameState.dealerHand = [];
        gameState.gameOver = false;

        await drawCards(4);
        
        gameState.playerHand = [gameState.dealerHand[0], gameState.dealerHand[2]];
        gameState.dealerHand = [gameState.dealerHand[1], gameState.dealerHand[3]];

        displayHands(true);
        
        hitBtn.disabled = false;
        standBtn.disabled = false;
        document.querySelector("#game-result").textContent = "";

        if (calculateHand(gameState.playerHand) === 21) {
            endGame("Blackjack! You win!");
        }
    }
    catch (err) {
        console.log(err);
        alert('Failed to deal cards');
    }
}

async function drawCards(count) {
    try {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${gameState.deckId}/draw/?count=${count}`);
        if (!response.ok) {
            throw Error(response.statusText);
        }
        const json = await response.json();
        console.log(`Draw ${count} Card(s) Response:`, json);
        
        if (count === 4) {
            gameState.dealerHand = json.cards;
        } else {
            return json.cards[0];
        }
    }
    catch (err) {
        console.log(err);
        alert('Failed to draw card');
    }
}

async function hit() {
    const card = await drawCards(1);
    gameState.playerHand.push(card);
    displayHands(true);

    const total = calculateHand(gameState.playerHand);
    if (total > 21) {
        endGame("Bust! You lose.");
    } else if (total === 21) {
        stand();
    }
}

async function stand() {
    hitBtn.disabled = true;
    standBtn.disabled = true;

    displayHands(false);

    let dealerTotal = calculateHand(gameState.dealerHand);
    
    while (dealerTotal < 17) {
        const card = await drawCards(1);
        gameState.dealerHand.push(card);
        displayHands(false);
        dealerTotal = calculateHand(gameState.dealerHand);
    }

    const playerTotal = calculateHand(gameState.playerHand);

    if (dealerTotal > 21) {
        endGame("Dealer busts! You win!");
    } else if (dealerTotal > playerTotal) {
        endGame("Dealer wins!");
    } else if (playerTotal > dealerTotal) {
        endGame("You win!");
    } else {
        endGame("Push! It's a tie.");
    }
}

function calculateHand(hand) {
    let total = 0;
    let aces = 0;

    for (let card of hand) {
        if (card.value === "ACE") {
            aces++;
            total += 11;
        } else if (card.value === "KING" || card.value === "QUEEN" || card.value === "JACK") {
            total += 10;
        } else {
            total += parseInt(card.value);
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

function displayHands(hideDealer) {
    const dealerHandEl = document.querySelector("#dealer-hand");
    const playerHandEl = document.querySelector("#player-hand");
    const dealerTotalEl = document.querySelector("#dealer-total");
    const playerTotalEl = document.querySelector("#player-total");

    let dealerText = "";
    if (hideDealer) {
        dealerText = `${gameState.dealerHand[0].value} of ${gameState.dealerHand[0].suit}, [Hidden]`;
        dealerTotalEl.textContent = "";
    } else {
        dealerText = gameState.dealerHand.map(card => `${card.value} of ${card.suit}`).join(", ");
        dealerTotalEl.textContent = `Total: ${calculateHand(gameState.dealerHand)}`;
    }

    const playerText = gameState.playerHand.map(card => `${card.value} of ${card.suit}`).join(", ");

    dealerHandEl.textContent = dealerText;
    playerHandEl.textContent = playerText;
    playerTotalEl.textContent = `Total: ${calculateHand(gameState.playerHand)}`;
}

function endGame(message) {
    gameState.gameOver = true;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    document.querySelector("#game-result").textContent = message;
    displayHands(false);
}