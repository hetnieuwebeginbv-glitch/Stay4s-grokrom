# Random Joke Generator

A fun and interactive joke generator application that fetches random jokes from multiple external APIs. Choose your favorite joke type and get a laugh!

## Features

✨ **Multi-API Support**
- JokeAPI - Multiple categories (Programming, Misc, Dark, Pun, Spooky, Christmas)
- Official Joke API - Clean and simple
- Random User Joke - Alternative source
- Chuck Norris Facts - Because Chuck Norris jokes are timeless

🎯 **Categories**
- Programming Jokes
- Miscellaneous Jokes
- Dark Jokes
- Pun Jokes
- Spooky Jokes
- Christmas Jokes
- Chuck Norris Facts

🛠️ **Technologies**
- HTML5 for structure
- CSS3 for styling (Responsive)
- Vanilla JavaScript for functionality
- Bootstrap 5 for UI components
- Fetch API for HTTP requests

## Project Structure

```
joke-generator/
├── index.html           # Main HTML file
├── styles.css           # Custom CSS styling
├── script.js            # Vanilla JavaScript implementation
├── python-version.py    # Python implementation
├── node-version.js      # Node.js implementation
└── README.md            # This file
```

## Installation & Usage

### Web Version (HTML/CSS/JavaScript)

1. Clone or download the project
2. Open `index.html` in your web browser
3. Select a joke category from the dropdown
4. Click "Get Joke" button
5. Enjoy the joke!

### Python Version

**Requirements:**
```bash
pip install requests
```

**Run:**
```bash
python python-version.py
```

### Node.js Version

**Requirements:**
```bash
npm init -y
npm install node-fetch
```

**Run:**
```bash
node node-version.js
```

## API Endpoints Used

### 1. JokeAPI
- **URL**: `https://v2.jokeapi.dev/joke/{category}`
- **Categories**: Programming, Misc, Dark, Pun, Spooky, Christmas
- **Filters**: Excludes NSFW, religious, political, racist, sexist jokes

### 2. Official Joke API
- **URL**: `https://official-joke-api.appspot.com/random_joke`
- **Returns**: Random programming or general joke

### 3. Random User Joke API
- **URL**: `https://api.api-ninjas.com/v1/jokes`
- **Note**: Requires free API key from https://api-ninjas.com/

### 4. Chuck Norris Jokes
- **URL**: `https://api.chucknorris.io/jokes/random`
- **Returns**: Random Chuck Norris fact

## Browser Compatibility

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile Browsers

## Examples

### JavaScript (Browser)
```javascript
// Select a category
const category = document.getElementById('jokeCategory').value;

// Fetch joke
fetch(`https://v2.jokeapi.dev/joke/${category}`)
  .then(response => response.json())
  .then(data => {
    // Display joke
    console.log(data.setup, data.delivery);
  });
```

### Python
```python
import requests

response = requests.get('https://v2.jokeapi.dev/joke/Programming')
joke = response.json()
print(f"{joke['setup']} - {joke['delivery']}")
```

### Node.js
```javascript
const fetch = require('node-fetch');

fetch('https://v2.jokeapi.dev/joke/Programming')
  .then(res => res.json())
  .then(data => console.log(data.setup, data.delivery));
```

## Error Handling

The application handles:
- Network errors
- API timeouts
- Invalid API responses
- Missing joke data

## Customization

### Add New Categories

1. **Update HTML dropdown:**
```html
<option value="NewCategory">New Joke Type</option>
```

2. **Update JavaScript:**
```javascript
const categories = ['Programming', 'Misc', 'NewCategory'];
```

### Change API

Modify the `fetchJoke()` function to use different endpoints:
```javascript
const apiUrl = 'https://your-new-api.com/joke';
```

## Performance Tips

- Results are cached for 5 seconds (configurable)
- Jokes are fetched asynchronously
- No blocking UI operations
- Minimal dependencies

## Troubleshooting

### "Failed to fetch joke"
- Check internet connection
- Verify API is accessible
- Check browser console for errors

### CORS Issues
- Some APIs may have CORS restrictions
- Use a CORS proxy if needed
- Try alternative APIs

### Empty Joke Display
- Clear browser cache
- Refresh the page
- Try different category

## Future Enhancements

- [ ] Save favorite jokes
- [ ] Share jokes on social media
- [ ] Dark mode toggle
- [ ] Joke filtering options
- [ ] Offline mode with cached jokes
- [ ] Mobile app version
- [ ] Internationalization (i18n)

## License

MIT License - Feel free to use and modify

## Credits

- [JokeAPI](https://jokeapi.dev/)
- [Official Joke API](https://official-joke-api.appspot.com/)
- [Chuck Norris API](https://api.chucknorris.io/)
- [API Ninjas](https://api-ninjas.com/)

## Support

For issues, suggestions, or contributions, please open a GitHub issue.

---

**Made with ❤️ for joke lovers everywhere**
