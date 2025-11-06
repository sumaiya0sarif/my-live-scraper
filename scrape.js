// scrape.js (Render.com-এর জন্য)

const puppeteer = require('puppeteer'); // puppeteer-core নয়
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

async function scrapeData() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            // executablePath-এর কোনো দরকার নেই
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        await page.goto('https://www.espn.in/football/scoreboard', {
            waitUntil: 'networkidle2'
        });

        // ...বাকি স্ক্র্যাপিং কোড অপরিবর্তিত...
        const data = await page.evaluate(() => {
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