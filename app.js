// Utility Functions
function americanToDecimal(odds) {
    if (odds > 0) {
        return (odds + 100) / 100;
    } else {
        return (100 - odds) / 100;
    }
}

function americanToImpliedProb(odds) {
    if (odds > 0) {
        return 100 / (odds + 100);
    } else {
        return -odds / (-odds + 100);
    }
}

function impliedProbToAmerican(prob) {
    if (prob >= 0.5) {
        return -(prob * 100) / (1 - prob);
    } else {
        return (100 * (1 - prob)) / prob;
    }
}

function decimalToAmerican(decimal) {
    if (decimal >= 2) {
        return (decimal - 1) * 100;
    } else {
        return -100 / (decimal - 1);
    }
}

// Kelly Criterion
function calculateKelly(trueProb, odds, bankroll) {
    if (!bankroll || bankroll <= 0) return { percent: 0, amount: 0 };
    
    const decimalOdds = americanToDecimal(odds);
    const q = 1 - trueProb;
    const p = trueProb;
    const b = decimalOdds - 1;
    
    if (b <= 0 || p <= 0) return { percent: 0, amount: 0 };
    
    const kellyPercent = (b * p - q) / b;
    
    // Apply fractional Kelly (0.5) for safety, limit to 10% max
    const safeKellyPercent = Math.min(Math.max(kellyPercent * 0.5, 0), 0.1);
    const kellyAmount = bankroll * safeKellyPercent;
    
    return {
        percent: safeKellyPercent * 100,
        amount: kellyAmount
    };
}

// Rounding logic for bet sizes
function roundBetSize(amount, odds, isFavorite) {
    // First round to nearest whole number
    let rounded = Math.round(amount);
    
    // For favorites (-101 or greater, meaning -101, -110, -150, etc.)
    if (isFavorite && odds <= -101) {
        // Round winning amount to nearest $50, then calculate wager from that
        const decimalOdds = americanToDecimal(odds);
        const winAmount = rounded * (decimalOdds - 1);
        const roundedWin = Math.round(winAmount / 50) * 50;
        const newWager = roundedWin / (decimalOdds - 1);
        return Math.round(newWager);
    }
    // For dogs (+101 or greater)
    else if (!isFavorite && odds >= 101) {
        // Round wager amount to nearest $50
        return Math.round(rounded / 50) * 50;
    }
    // Default: already rounded to nearest whole number
    return rounded;
}

function roundWinAmount(wagerAmount, odds, isFavorite) {
    const decimalOdds = americanToDecimal(odds);
    let winAmount = wagerAmount * (decimalOdds - 1);
    
    // For favorites -101 or greater, win amount should already be rounded to $50
    if (isFavorite && odds <= -101) {
        winAmount = Math.round(winAmount / 50) * 50;
    }
    
    return Math.round(winAmount);
}

// EV Calculation
function calculateEV(trueProb, recOdds, side) {
    if (!trueProb || !recOdds) return null;
    
    const recDecimal = americanToDecimal(recOdds);
    const winProb = trueProb;
    const loseProb = 1 - trueProb;
    
    // For a $1 bet
    const winAmount = recDecimal - 1;
    const ev = (winProb * winAmount) - (loseProb * 1);
    
    return {
        ev: ev * 100, // As percentage
        evDecimal: ev,
        trueProb: winProb,
        recOdds: recOdds
    };
}

// Tab Switching
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Load bankroll from localStorage
    const savedBankroll = localStorage.getItem('bankroll');
    if (savedBankroll) {
        document.getElementById('bankroll').value = savedBankroll;
        document.getElementById('teaser-bankroll').value = savedBankroll;
    }
    
    // Sync bankroll between tabs
    function syncBankroll(value) {
        localStorage.setItem('bankroll', value);
        document.getElementById('bankroll').value = value;
        document.getElementById('teaser-bankroll').value = value;
    }
    
    // Save bankroll on change
    document.getElementById('bankroll').addEventListener('input', function() {
        syncBankroll(this.value);
    });
    
    document.getElementById('teaser-bankroll').addEventListener('input', function() {
        syncBankroll(this.value);
    });
    
    // Calculate implied probabilities
    document.getElementById('calculate-implied').addEventListener('click', function() {
        const favLine = parseFloat(document.getElementById('sharp-favorite').value);
        const dogLine = parseFloat(document.getElementById('sharp-underdog').value);
        
        if (!favLine || !dogLine) {
            alert('Please enter both sharp book lines');
            return;
        }
        
        const favProb = americanToImpliedProb(favLine);
        const dogProb = americanToImpliedProb(dogLine);
        
        document.getElementById('implied-fav').textContent = (favProb * 100).toFixed(2) + '%';
        document.getElementById('implied-dog').textContent = (dogProb * 100).toFixed(2) + '%';
        document.getElementById('implied-probs').style.display = 'block';
    });
    
    // Calculate EV
    document.getElementById('calculate-ev').addEventListener('click', function() {
        const favLine = parseFloat(document.getElementById('sharp-favorite').value);
        const dogLine = parseFloat(document.getElementById('sharp-underdog').value);
        const recLine = parseFloat(document.getElementById('rec-line').value);
        const betSide = document.getElementById('bet-side').value;
        const bankroll = parseFloat(document.getElementById('bankroll').value) || 0;
        
        if (!favLine || !dogLine || !recLine) {
            alert('Please enter all required lines');
            return;
        }
        
        // Get true probability from sharp book
        const trueProb = betSide === 'favorite' 
            ? americanToImpliedProb(favLine)
            : americanToImpliedProb(dogLine);
        
        // Calculate EV
        const evResult = calculateEV(trueProb, recLine, betSide);
        
        if (!evResult) {
            alert('Error calculating EV');
            return;
        }
        
        // Calculate Kelly
        const isFavorite = betSide === 'favorite';
        const kelly = calculateKelly(trueProb, recLine, bankroll);
        const roundedWager = roundBetSize(kelly.amount, recLine, isFavorite);
        const winAmount = roundWinAmount(roundedWager, recLine, isFavorite);
        
        // Display results
        document.getElementById('ev-value').textContent = evResult.ev.toFixed(2) + '%';
        document.getElementById('ev-value').className = 'value ' + (evResult.ev >= 0 ? 'positive' : 'negative');
        document.getElementById('true-prob').textContent = (trueProb * 100).toFixed(2) + '%';
        document.getElementById('kelly-percent').textContent = kelly.percent.toFixed(2) + '%';
        document.getElementById('optimal-wager').textContent = '$' + roundedWager.toLocaleString();
        document.getElementById('potential-win').textContent = '$' + winAmount.toLocaleString();
        
        document.getElementById('ev-results').style.display = 'block';
    });
    
    // Initialize teaser legs
    function initializeTeaserLegs() {
        const numLegs = parseInt(document.getElementById('teaser-legs').value);
        const container = document.getElementById('teaser-legs-container');
        container.innerHTML = '';
        
        for (let i = 1; i <= numLegs; i++) {
            const legDiv = document.createElement('div');
            legDiv.className = 'teaser-leg';
            legDiv.innerHTML = `
                <h3>Leg ${i}</h3>
                <div class="input-group">
                    <label>Home or Away?</label>
                    <select class="leg-location" data-leg="${i}">
                        <option value="home">Home</option>
                        <option value="away">Away</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Teaser Line (e.g., +2.5 or -8.5)</label>
                    <input type="number" class="leg-line" data-leg="${i}" placeholder="e.g., 2.5 or -8.5" step="0.5">
                    <small style="color: var(--text-secondary); font-size: 12px; margin-top: 4px; display: block;">Line after teaser points added</small>
                </div>
                <div class="input-group">
                    <label>Book Odds on Teaser Line</label>
                    <input type="number" class="leg-odds" data-leg="${i}" placeholder="e.g., -110, -120, -130" step="1">
                </div>
            `;
            container.appendChild(legDiv);
        }
    }
    
    document.getElementById('teaser-legs').addEventListener('change', initializeTeaserLegs);
    initializeTeaserLegs();
    
    // Wong Teaser EV Calculation
    document.getElementById('calculate-teaser').addEventListener('click', function() {
        const numLegs = parseInt(document.getElementById('teaser-legs').value);
        const pushHandling = document.getElementById('push-handling').value;
        const teaserOddsInput = parseFloat(document.getElementById('teaser-odds').value);
        const bankroll = parseFloat(document.getElementById('teaser-bankroll').value) || 0;
        
        if (!teaserOddsInput || isNaN(teaserOddsInput)) {
            alert('Please enter the teaser odds');
            return;
        }
        
        const legs = [];
        
        for (let i = 1; i <= numLegs; i++) {
            const location = document.querySelector(`.leg-location[data-leg="${i}"]`).value;
            const line = parseFloat(document.querySelector(`.leg-line[data-leg="${i}"]`).value);
            const odds = parseFloat(document.querySelector(`.leg-odds[data-leg="${i}"]`).value);
            
            if (isNaN(line) || isNaN(odds)) {
                alert(`Please fill in all fields for Leg ${i}`);
                return;
            }
            
            // For Wong teasers, we calculate the adjusted probability based on the odds
            // The odds represent the book's line on the teaser leg at the new spread
            // We'll use the implied probability from those odds
            const impliedProb = americanToImpliedProb(odds);
            
            // Estimate push probability based on line (simplified model)
            // Common push points: 3, 7, 10, 14, etc.
            // For teasers, pushes are less common but still possible
            let pushProb = 0;
            const absLine = Math.abs(line);
            
            // Very rough push probability estimation
            // In reality, this would come from historical data
            if (absLine % 1 === 0) {
                // Whole number line has push possibility
                pushProb = 0.01; // ~1% push probability for whole numbers
            } else if (absLine % 0.5 === 0) {
                // Half point line, very low push probability
                pushProb = 0.001; // ~0.1% for half points
            }
            
            legs.push({
                location,
                line,
                odds,
                impliedProb,
                pushProb
            });
        }
        
        // Calculate combined probability based on push handling
        let combinedProb = 1;
        
        if (pushHandling === 'loss') {
            // Push = loss means we only win if all legs win (no pushes)
            legs.forEach(leg => {
                combinedProb *= leg.impliedProb;
            });
        } else if (pushHandling === 'void') {
            // Push = void means push cancels that leg, probability is conditional
            // For simplicity, we'll use: P(win) = P(win | no push) * P(no push)
            legs.forEach(leg => {
                const noPushProb = 1 - leg.pushProb;
                // Adjusted win probability given no push
                const adjustedWinProb = leg.impliedProb / noPushProb;
                combinedProb *= adjustedWinProb * noPushProb;
            });
        } else if (pushHandling === 'push') {
            // Push = leg push means we need all non-push legs to win
            // Probability is: product of (win prob / (1 - push prob)) * (1 - push prob)
            legs.forEach(leg => {
                // Win probability excluding pushes
                const noPushProb = 1 - leg.pushProb;
                const winGivenNoPush = leg.impliedProb / (noPushProb + 1e-10); // Avoid division by zero
                combinedProb *= winGivenNoPush * noPushProb;
            });
        }
        
        // Ensure probability is valid
        combinedProb = Math.max(0, Math.min(1, combinedProb));
        
        // Calculate EV
        const evResult = calculateEV(combinedProb, teaserOddsInput, 'favorite');
        
        if (!evResult) {
            alert('Error calculating teaser EV');
            return;
        }
        
        // Calculate Kelly
        const kelly = calculateKelly(combinedProb, teaserOddsInput, bankroll);
        const roundedWager = Math.round(kelly.amount / 50) * 50; // Round to nearest $50 for teasers
        
        // Display results
        document.getElementById('teaser-ev').textContent = evResult.ev.toFixed(2) + '%';
        document.getElementById('teaser-ev').className = 'value ' + (evResult.ev >= 0 ? 'positive' : 'negative');
        document.getElementById('teaser-prob').textContent = (combinedProb * 100).toFixed(2) + '%';
        document.getElementById('teaser-kelly').textContent = kelly.percent.toFixed(2) + '%';
        document.getElementById('teaser-wager').textContent = '$' + roundedWager.toLocaleString();
        
        document.getElementById('teaser-results').style.display = 'block';
    });
});
