#!/usr/bin/env python3
"""
Random Joke Generator - Python Version

A command-line joke generator that fetches jokes from multiple APIs.
Usage: python python-version.py
"""

import requests
import json
import sys
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class JokeGenerator:
    """A joke generator that fetches from multiple APIs."""

    # API Endpoints
    JOKE_API_URL = "https://v2.jokeapi.dev/joke/{category}"
    OFFICIAL_API_URL = "https://official-joke-api.appspot.com/random_joke"
    CHUCK_NORRIS_URL = "https://api.chucknorris.io/jokes/random"
    
    # Categories
    CATEGORIES = [
        "Programming",
        "Misc",
        "Dark",
        "Pun",
        "Spooky",
        "Christmas",
        "ChuckNorris"
    ]

    def __init__(self):
        """Initialize the joke generator."""
        self.joke_count = 0
        self.cache = {}
        self.cache_timeout = timedelta(seconds=5)
        self.timeout = 10  # Request timeout in seconds

    def display_menu(self) -> str:
        """Display category menu and get user choice."""
        print("\n" + "="*50)
        print("😂 Random Joke Generator")
        print("="*50)
        print("\nSelect a joke category:\n")
        
        for i, category in enumerate(self.CATEGORIES, 1):
            emoji = self._get_emoji(category)
            print(f"{i}. {emoji} {category}")
        
        print(f"{len(self.CATEGORIES) + 1}. 🚪 Exit")
        
        while True:
            try:
                choice = int(input("\nEnter your choice (1-{}): ".format(len(self.CATEGORIES) + 1)))
                if 1 <= choice <= len(self.CATEGORIES):
                    return self.CATEGORIES[choice - 1]
                elif choice == len(self.CATEGORIES) + 1:
                    print("\nThanks for using Joke Generator! 👋")
                    sys.exit(0)
                else:
                    print("Invalid choice. Please try again.")
            except ValueError:
                print("Please enter a valid number.")

    def fetch_joke(self, category: str) -> Optional[Dict[str, Any]]:
        """Fetch a joke from the API."""
        # Check cache
        if category in self.cache:
            cached_time, joke = self.cache[category]
            if datetime.now() - cached_time < self.cache_timeout:
                print("\n[Using cached joke]")
                return joke

        print("\n🔄 Fetching joke...")
        
        try:
            if category == "ChuckNorris":
                joke = self._fetch_chuck_norris()
            else:
                joke = self._fetch_from_joke_api(category)
            
            # Cache the joke
            self.cache[category] = (datetime.now(), joke)
            self.joke_count += 1
            return joke
        
        except requests.RequestException as e:
            print(f"\n❌ Error: {e}")
            print("Trying alternative API...")
            try:
                joke = self._fetch_from_official_api()
                self.joke_count += 1
                return joke
            except requests.RequestException as e2:
                print(f"❌ Alternative API also failed: {e2}")
                return None

    def _fetch_from_joke_api(self, category: str) -> Dict[str, Any]:
        """Fetch from JokeAPI."""
        url = self.JOKE_API_URL.format(category=category)
        params = {"format": "json", "safe-mode": True}
        
        response = requests.get(url, params=params, timeout=self.timeout)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("error"):
            raise ValueError(data.get("message", "Unknown error"))
        
        return {
            "type": data.get("type"),
            "setup": data.get("setup", ""),
            "delivery": data.get("delivery") or data.get("joke", "No joke available"),
            "source": "JokeAPI"
        }

    def _fetch_from_official_api(self) -> Dict[str, Any]:
        """Fetch from Official Joke API."""
        response = requests.get(self.OFFICIAL_API_URL, timeout=self.timeout)
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "type": "twopart",
            "setup": data.get("setup"),
            "delivery": data.get("punchline"),
            "source": "Official Joke API"
        }

    def _fetch_chuck_norris(self) -> Dict[str, Any]:
        """Fetch from Chuck Norris API."""
        response = requests.get(self.CHUCK_NORRIS_URL, timeout=self.timeout)
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "type": "single",
            "setup": "Chuck Norris Fact:",
            "delivery": data.get("value"),
            "source": "Chuck Norris API"
        }

    def display_joke(self, joke: Dict[str, Any]) -> None:
        """Display the joke in a formatted way."""
        if not joke:
            return
        
        print("\n" + "="*50)
        if joke.get("type") == "single":
            print(f"\n{joke.get('setup')}\n{joke.get('delivery')}")
        else:
            print(f"\n{joke.get('setup')}\n")
            print(f">>> {joke.get('delivery')}")
        print("\n" + "="*50)
        print(f"Source: {joke.get('source')}")
        print(f"Total jokes fetched: {self.joke_count}")

    @staticmethod
    def _get_emoji(category: str) -> str:
        """Get emoji for category."""
        emojis = {
            "Programming": "👨‍💻",
            "Misc": "🎪",
            "Dark": "🌑",
            "Pun": "🎯",
            "Spooky": "👻",
            "Christmas": "🎄",
            "ChuckNorris": "💪"
        }
        return emojis.get(category, "😂")

    def run(self) -> None:
        """Main loop."""
        try:
            while True:
                category = self.display_menu()
                joke = self.fetch_joke(category)
                if joke:
                    self.display_joke(joke)
                else:
                    print("\n❌ Failed to fetch a joke. Please try again.")
                
                input("\nPress Enter to continue...")
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            sys.exit(0)


def main():
    """Entry point."""
    try:
        generator = JokeGenerator()
        generator.run()
    except Exception as e:
        print(f"\nFatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
