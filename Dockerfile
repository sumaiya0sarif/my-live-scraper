# 1. প্রথমে Node.js-এর একটি অফিসিয়াল ইমেজ দিয়ে শুরু করুন
FROM node:20

# 2. কাজের ডিরেক্টরি সেট করুন
WORKDIR /usr/src/app

# 3. Google Chrome ইন্সটল করার জন্য প্রয়োজনীয় সব টুলস ইন্সটল করুন
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    hicolor-icon-theme \
    libglib2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    --no-install-recommends

# 4. Google-এর অফিসিয়াল কী (key) এবং সোর্স যোগ করুন
RUN curl -sS -L https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list

# 5. Google Chrome ইন্সটল করুন
RUN apt-get update && apt-get install -y \
    google-chrome-stable \
    --no-install-recommends

# 6. আপনার package ফাইলগুলো কপি করুন
COPY package*.json ./

# 7. npm install চালান (এটি এখন puppeteer-core ইন্সটল করবে)
RUN npm install

# 8. আপনার বাকি কোড কপি করুন
COPY . .

# 9. পোর্ট এক্সপোজ করুন
EXPOSE 3000

# 10. অ্যাপটি চালু করুন
CMD ["node", "scrape.js"]
