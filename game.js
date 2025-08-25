class OichoKabu {
    constructor() {
        this.deck = [];
        this.playerCards = [];
        this.dealerCards = [];
        this.chips = 1000;
        this.currentBet = 100;
        this.gameActive = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateChipsDisplay();
    }
    
    initializeElements() {
        this.playerCardsEl = document.getElementById('player-cards');
        this.dealerCardsEl = document.getElementById('dealer-cards');
        this.playerScoreEl = document.getElementById('player-score');
        this.dealerScoreEl = document.getElementById('dealer-score');
        this.resultEl = document.getElementById('result');
        this.chipsEl = document.getElementById('chips');
        this.betAmountEl = document.getElementById('bet-amount');
        this.hitBtn = document.getElementById('hit-btn');
        this.standBtn = document.getElementById('stand-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
    }
    
    attachEventListeners() {
        this.hitBtn.addEventListener('click', () => this.hit());
        this.standBtn.addEventListener('click', () => this.stand());
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.betAmountEl.addEventListener('change', (e) => {
            this.currentBet = Math.min(Math.max(10, parseInt(e.target.value)), this.chips);
            this.betAmountEl.value = this.currentBet;
        });
    }
    
    createDeck() {
        this.deck = [];
        const suits = ['♠', '♥', '♦', '♣'];
        
        for (let suit of suits) {
            for (let value = 1; value <= 10; value++) {
                this.deck.push({
                    suit: suit,
                    value: value,
                    display: value === 10 ? '10' : value.toString(),
                    color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
                });
            }
        }
        
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    drawCard() {
        return this.deck.pop();
    }
    
    calculateScore(cards) {
        if (cards.length === 0) return 0;
        
        const sum = cards.reduce((total, card) => total + card.value, 0);
        const score = sum % 10;
        
        if (cards.length === 3) {
            const values = cards.map(c => c.value).sort();
            if (values[0] === values[1] && values[1] === values[2]) {
                return 100 + values[0];
            }
        }
        
        if (cards.length === 2) {
            const values = cards.map(c => c.value).sort();
            if ((values[0] === 1 && values[1] === 4) || (values[0] === 4 && values[1] === 1)) {
                return 50;
            }
            if ((values[0] === 1 && values[1] === 9) || (values[0] === 9 && values[1] === 1)) {
                return 40;
            }
        }
        
        return score;
    }
    
    getScoreDisplay(score) {
        if (score >= 100) {
            return `アラシ (${score - 100})`;
        }
        if (score === 50) {
            return 'シッピン';
        }
        if (score === 40) {
            return 'クッピン';
        }
        if (score === 9) {
            return 'カブ (9)';
        }
        return score.toString();
    }
    
    displayCard(card, container, hidden = false) {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${hidden ? 'back' : card.color}`;
        
        if (hidden) {
            cardEl.textContent = '?';
        } else {
            cardEl.innerHTML = `${card.display}${card.suit}`;
        }
        
        container.appendChild(cardEl);
    }
    
    updateDisplay(revealDealer = false) {
        this.playerCardsEl.innerHTML = '';
        this.dealerCardsEl.innerHTML = '';
        
        this.playerCards.forEach(card => this.displayCard(card, this.playerCardsEl));
        
        this.dealerCards.forEach((card, index) => {
            this.displayCard(card, this.dealerCardsEl, !revealDealer && index > 0);
        });
        
        const playerScore = this.calculateScore(this.playerCards);
        this.playerScoreEl.textContent = `得点: ${this.getScoreDisplay(playerScore)}`;
        
        if (revealDealer) {
            const dealerScore = this.calculateScore(this.dealerCards);
            this.dealerScoreEl.textContent = `得点: ${this.getScoreDisplay(dealerScore)}`;
        } else {
            this.dealerScoreEl.textContent = '得点: -';
        }
    }
    
    newGame() {
        if (this.chips < 10) {
            this.resultEl.textContent = 'ゲームオーバー！所持金がなくなりました。';
            this.resultEl.className = 'result lose';
            return;
        }
        
        this.currentBet = Math.min(this.currentBet, this.chips);
        this.betAmountEl.value = this.currentBet;
        
        this.createDeck();
        this.playerCards = [];
        this.dealerCards = [];
        this.gameActive = true;
        
        this.playerCards.push(this.drawCard());
        this.playerCards.push(this.drawCard());
        this.dealerCards.push(this.drawCard());
        this.dealerCards.push(this.drawCard());
        
        this.resultEl.textContent = '';
        this.resultEl.className = 'result';
        
        this.updateDisplay(false);
        
        this.hitBtn.disabled = false;
        this.standBtn.disabled = false;
        this.betAmountEl.disabled = true;
    }
    
    hit() {
        if (!this.gameActive || this.playerCards.length >= 3) return;
        
        this.playerCards.push(this.drawCard());
        this.updateDisplay(false);
        
        if (this.playerCards.length === 3) {
            this.hitBtn.disabled = true;
        }
    }
    
    stand() {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        this.hitBtn.disabled = true;
        this.standBtn.disabled = true;
        
        while (this.dealerCards.length < 3) {
            const dealerScore = this.calculateScore(this.dealerCards);
            if (dealerScore >= 7 || (dealerScore >= 5 && this.dealerCards.length === 2)) {
                break;
            }
            this.dealerCards.push(this.drawCard());
        }
        
        this.updateDisplay(true);
        this.determineWinner();
        this.betAmountEl.disabled = false;
    }
    
    determineWinner() {
        const playerScore = this.calculateScore(this.playerCards);
        const dealerScore = this.calculateScore(this.dealerCards);
        
        let resultText = '';
        let resultClass = '';
        
        if (playerScore > dealerScore) {
            resultText = '勝利！おめでとうございます！';
            resultClass = 'win';
            this.chips += this.currentBet;
        } else if (playerScore < dealerScore) {
            resultText = '負け...次は頑張りましょう！';
            resultClass = 'lose';
            this.chips -= this.currentBet;
        } else {
            resultText = '引き分け';
            resultClass = 'tie';
        }
        
        this.resultEl.textContent = resultText;
        this.resultEl.className = `result ${resultClass}`;
        this.updateChipsDisplay();
        
        if (this.chips < 10) {
            setTimeout(() => {
                this.resultEl.textContent = 'ゲームオーバー！所持金がなくなりました。リロードして再開してください。';
                this.resultEl.className = 'result lose';
                this.newGameBtn.disabled = true;
            }, 2000);
        }
    }
    
    updateChipsDisplay() {
        this.chipsEl.textContent = this.chips;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new OichoKabu();
});