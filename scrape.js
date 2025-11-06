// scrape.js (Docker ভার্সন)

const puppeteer = require('puppeteer-core'); // 1. puppeteer-core ব্যবহার করুন
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

async function scrapeData() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            // 2. Docker-এ Chrome-এর সঠিক পাথ (path)
            executablePath: '/usr/bin/google-chrome-stable', 
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        // ...বাকি কোড সব অপরিবর্তিত থাকবে...

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        await page.goto('https://www.espn.in/football/scoreboard', {
            waitUntil: 'networkidle2'
        });

        const data = await page.evaluate(() => {
            // ...স্ক্র্যাপিং কোড...
            const matchCards = document.querySelectorAll('section.Scoreboard.bg-clr-white');
            const results = [];
            matchCards.forEach(card => {
                const time = card.querySelector('div.ScoreCell__Time')?.innerText ?? 'N/A';
                const teamName1 = card.querySelector('.ScoreboardScoreCell__Item--home .ScoreCell__TeamName')?.innerText ?? 'N/A';
                const score1 = card.querySelector('.ScoreboardScoreCell__Item--home .ScoreCell__Score')?.innerText ?? '-';
                const teamName2 = card.querySelector('.ScoreboardScoreCell__Item--away .ScoreCell__TeamName')?.innerText ?? 'N/A';
                const score2 = card.querySelector('.ScoreboardScoreCell__Item--away .ScoreCell__Score')?.innerText ?? '-';
                const venue = card.querySelector('.LocationDetail__Item--headline')?.innerText ?? 'N/A';
                const location = card.querySelector('.LocationDetail__Item:not(.LocationDetail__Item--headline)')?.innerText ?? '';
                results.push({ time, team1, score1, team2, score2, venue: `${venue}, ${location}` });
            });
            return results;
        });

        await browser.close();
        return data; 

    } catch (error) {
        console.error("Scraping Error:", error);
        if (browser) await browser.close();
        return { error: "Failed to scrape data" };
    }
}

// ...বাকি express সার্ভারের কোড অপরিবর্তিত থাকবে...
app.get('/data', async (req, res) => {
    console.log("Fetching data...");
    const scrapedData = await scrapeData();
    console.log("Data fetched.");
    res.json(scrapedData);
});

app.get('/', (req, res) => {
    res.send('Scraper API is running. Go to /data to get scores.');
});

app.listen(PORT, () => {
    console.log(`Scraper server listening on port ${PORT}`);
});
