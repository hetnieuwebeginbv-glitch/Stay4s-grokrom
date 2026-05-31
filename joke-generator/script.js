// ===================================
// RANDOM JOKE GENERATOR - JAVASCRIPT
// ===================================

class JokeGenerator {
    constructor() {
        this.currentJoke = null;
        this.jokeCount = 0;
        this.cache = {};
        this.cacheTimeout = 5000; // 5 seconds
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
    }

    cacheElements() {
        this.elements = {
            categorySelect: document.getElementById('jokeCategory'),
            jokeDisplay: document.getElementById('jokeDisplay'),
            getJokeBtn: document.getElementById('getJokeBtn'),
            shareJokeBtn: document.getElementById('shareJokeBtn'),
            copyJokeBtn: document.getElementById('copyJokeBtn'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            jokeCount: document.getElementById('jokeCount'),
            categoryDisplay: document.getElementById('categoryDisplay')
        };
    }

    attachEventListeners() {
        this.elements.getJokeBtn.addEventListener('click', () => this.fetchAndDisplayJoke());
        this.elements.shareJokeBtn.addEventListener('click', () => this.shareJoke());
        this.elements.copyJokeBtn.addEventListener('click', () => this.copyToClipboard());
        this.elements.categorySelect.addEventListener('change', () => this.updateCategoryDisplay());
    }

    async fetchAndDisplayJoke() {
        const category = this.elements.categorySelect.value;
        this.showLoading(true);
        this.hideError();

        try {
            const joke = await this.fetchJoke(category);
            this.currentJoke = joke;
            this.displayJoke(joke);
            this.jokeCount++;
            this.elements.jokeCount.textContent = this.jokeCount;
        } catch (error) {
            this.showError(`Failed to fetch joke: ${error.message}`);
            console.error('Joke fetch error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async fetchJoke(category) {
        const cacheKey = category;
        
        // Check cache
        if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < this.cacheTimeout) {
            return this.cache[cacheKey].data;
        }

        let joke;
        try {
            // Try JokeAPI first
            if (category === 'ChuckNorris') {
                joke = await this.fetchChuckNorrisJoke();
            } else {
                joke = await this.fetchFromJokeAPI(category);
            }
        } catch (error1) {
            try {
                // Fallback to Official Joke API
                joke = await this.fetchFromOfficialAPI();
            } catch (error2) {
                throw new Error('All joke APIs are currently unavailable');
            }
        }

        // Cache the joke
        this.cache[cacheKey] = {
            data: joke,
            timestamp: Date.now()
        };

        return joke;
    }

    async fetchFromJokeAPI(category) {
        const url = `https://v2.jokeapi.dev/joke/${category}?format=json&safe-mode`;
        const response = await fetch(url, { timeout: 10000 });

        if (!response.ok) {
            throw new Error(`JokeAPI error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.message);
        }

        return {
            type: data.type,
            setup: data.setup || '',
            delivery: data.delivery || data.joke || 'No joke available',
            source: 'JokeAPI'
        };
    }

    async fetchFromOfficialAPI() {
        const url = 'https://official-joke-api.appspot.com/random_joke';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Official API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            type: 'twopart',
            setup: data.setup,
            delivery: data.punchline,
            source: 'Official Joke API'
        };
    }

    async fetchChuckNorrisJoke() {
        const url = 'https://api.chucknorris.io/jokes/random';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Chuck Norris API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            type: 'single',
            setup: 'Chuck Norris Fact:',
            delivery: data.value,
            source: 'Chuck Norris API'
        };
    }

    displayJoke(joke) {
        const jokeHTML = this.formatJokeHTML(joke);
        this.elements.jokeDisplay.innerHTML = `<div class="card-body">${jokeHTML}</div>`;
        this.elements.jokeDisplay.classList.add('fade-in');
    }

    formatJokeHTML(joke) {
        if (joke.type === 'single') {
            return `
                <p class="joke-text">
                    <strong class="joke-setup">${this.escapeHtml(joke.setup)}</strong>
                    <br>
                    <span class="joke-delivery">${this.escapeHtml(joke.delivery)}</span>
                </p>
                <small class="text-muted mt-2">From: ${joke.source}</small>
            `;
        } else {
            return `
                <p class="joke-text">
                    <strong class="joke-setup">${this.escapeHtml(joke.setup)}</strong>
                    <br>
                    <span class="joke-delivery">${this.escapeHtml(joke.delivery)}</span>
                </p>
                <small class="text-muted mt-2">From: ${joke.source}</small>
            `;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    shareJoke() {
        if (!this.currentJoke) {
            this.showError('Please fetch a joke first!');
            return;
        }

        const jokeText = this.getJokeText();
        const shareText = `${jokeText}\n\n😂 Random Joke Generator`;

        // Try native share API
        if (navigator.share) {
            navigator.share({
                title: 'Check out this joke!',
                text: shareText
            }).catch(err => console.log('Share error:', err));
        } else {
            // Fallback: Copy to clipboard
            this.copyToClipboard();
            this.showSuccess('Joke copied to clipboard! You can now share it.');
        }
    }

    copyToClipboard() {
        if (!this.currentJoke) {
            this.showError('Please fetch a joke first!');
            return;
        }

        const jokeText = this.getJokeText();
        
        navigator.clipboard.writeText(jokeText).then(() => {
            this.showSuccess('Joke copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = jokeText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showSuccess('Joke copied to clipboard!');
        });
    }

    getJokeText() {
        const setup = this.currentJoke.setup || '';
        const delivery = this.currentJoke.delivery || '';
        return `${setup}${setup && delivery ? '\n' : ''}${delivery}`;
    }

    updateCategoryDisplay() {
        const category = this.elements.categorySelect.value;
        this.elements.categoryDisplay.textContent = category;
    }

    showLoading(show) {
        this.elements.loadingSpinner.style.display = show ? 'block' : 'none';
        this.elements.getJokeBtn.disabled = show;
        this.elements.getJokeBtn.innerHTML = show 
            ? '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading...' 
            : '<span class="me-2">🎲</span>Get Joke';
    }

    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.style.display = 'block';
    }

    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }

    showSuccess(message) {
        // Create temporary success alert
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        this.elements.errorMessage.parentElement.insertBefore(alert, this.elements.errorMessage);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new JokeGenerator();
});
