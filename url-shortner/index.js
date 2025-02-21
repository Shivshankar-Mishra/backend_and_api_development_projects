require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

const urlMap = {};
let shortUrlCounter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  // Validate URL format and use dns.lookup
  try {
    const urlObj = new URL(originalUrl); // Check if it's a valid URL format
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        res.json({ error: 'invalid url' });
        return;
      }

      const shortUrl = shortUrlCounter++;
      urlMap[shortUrl] = originalUrl;

      res.json({ original_url: originalUrl, short_url: shortUrl });
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:shorturl', function (req, res) {
  const shortUrl = parseInt(req.params.shorturl); // Parse to integer

  if (urlMap[shortUrl]) {
    res.redirect(urlMap[shortUrl]);
  } else {
    res.json({ error: 'invalid short url' }); // Or redirect to an error page
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
