#!/usr/bin/env node

/**
 * Random Joke Generator - Node.js Version
 * A command-line joke generator that fetches jokes from multiple APIs.
 */

const fetch = require('node-fetch');
const readline = require('readline');

class JokeGenerator {
    constructor() {
        this.jokeCount = 0;
        this.cache = {};
        this.cacheTimeout = 5000; // 5 seconds
        this.timeout = 10000; // Request timeout in ms
        
        this.categories = [
            'Programming',
            'Misc',
            'Dark',
            'Pun',
            'Spooky',
            'Christmas',
            'ChuckNorris'
        ];
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    getEmoji(category) {
        const emojis = {
            'Programming': '👨‍💻',
            'Misc': '🎪',
            'Dark': '🌑',
            'Pun': '🎯',
            'Spooky': '👻',
            'Christmas': '🎄',
            'ChuckNorris': '💪'
        };
        return emojis[category] || '😂';
    }

    displayMenu() {
        return new Promise((resolve) => {
            console.clear();
            console.log('\n' + '='.repeat(50));
            console.log('😂 Random Joke Generator');
            console.log('='.repeat(50));
            console.log('\nSelect a joke category:\n');
            
            this.categories.forEach((category, i) => {
                const emoji = this.getEmoji(category);
                console.log(`${i + 1}. ${emoji} ${category}`);
            });
            console.log(`${this.categories.length + 1}. 🚪 Exit\n`);
            
            const askQuestion = () => {
                this.rl.question(`Enter your choice (1-${this.categories.length + 1}): `, (answer) => {
                    const choice = parseInt(answer);
                    
                    if (choice === this.categories.length + 1) {
                        console.log('\nThanks for using Joke Generator! 👋');
                        process.exit(0);
                    } else if (choice >= 1 && choice <= this.categories.length) {
                        resolve(this.categories[choice - 1]);
                    } else {
                        console.log('Invalid choice. Please try again.');
                        askQuestion();
                    }
                });
            };
            askQuestion();
        });
    }

    async fetchJoke(category) {
        // Check cache
        if (this.cache[category] && Date.now() - this.cache[category].timestamp < this.cacheTimeout) {
            console.log('\n[Using cached joke]');
            return this.cache[category].data;
        }

        console.log('\n🔄 Fetching joke...');
        
        try {
            let joke;
            if (category === 'ChuckNorris') {
                joke = await this.fetchChuckNorris();
            } else {
                joke = await this.fetchFromJokeAPI(category);
            }
            
            // Cache the joke
            this.cache[category] = {
                data: joke,
                timestamp: Date.now()
            };
            
            this.jokeCount++;
            return joke;
        } catch (error) {
            console.log(`\n❌ Error: ${error.message}`);
            console.log('Trying alternative API...');
            
            try {
                const joke = await this.fetchFromOfficialAPI();
                this.jokeCount++;
                return joke;
            } catch (error2) {
                console.log(`❌ Alternative API also failed: ${error2.message}`);
                return null;
            }
        }
    }

    async fetchFromJokeAPI(category) {
        const url = `https://v2.jokeapi.dev/joke/${category}?format=json&safe-mode`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`JokeAPI error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.message || 'Unknown error');
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

    async fetchChuckNorris() {
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
        if (!joke) return;
        
        console.log('\n' + '='.repeat(50));
        if (joke.type === 'single') {
            console.log(`\n${joke.setup}\n${joke.delivery}`);
        } else {
            console.log(`\n${joke.setup}\n`);
            console.log(`>>> ${joke.delivery}`);
        }
        console.log('\n' + '='.repeat(50));
        console.log(`Source: ${joke.source}`);
        console.log(`Total jokes fetched: ${this.jokeCount}`);
    }

    async run() {
        try {
            while (true) {
                const category = await this.displayMenu();
                const joke = await this.fetchJoke(category);
                if (joke) {
                    this.displayJoke(joke);
                } else {
                    console.log('\n❌ Failed to fetch a joke. Please try again.');
                }
                
                await new Promise((resolve) => {
                    this.rl.question('\nPress Enter to continue...', () => {
                        resolve();
                    });
                });
            }
        } catch (error) {
            console.error('Fatal error:', error);
            process.exit(1);
        }
    }

    close() {
        this.rl.close();
    }
}

// Main entry point
if (require.main === module) {
    const generator = new JokeGenerator();
    generator.run().catch((error) => {
        console.error('Error:', error);
        generator.close();
        process.exit(1);
    });
}

module.exports = JokeGenerator;
