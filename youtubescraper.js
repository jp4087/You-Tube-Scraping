const puppeteer = require('puppeteer');

const fs = require("fs");
let scrape = async () => {
    const browser = await puppeteer.launch({headless: false, defaultViewport : false,
        args : ["--start-maximized"]});
    const page = await browser.newPage();

    await page.goto('https://www.youtube.com/c/Pepcoding/videos');
    var links =[];
    for (var i=1; i<=10; i++){ 
        //grab href and src(thumbnail) of each video

        var href = await page.$$eval("ytd-grid-video-renderer.style-scope:nth-child("+i+") > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > h3:nth-child(1) > a:nth-child(2)", el => el.map(x => x.getAttribute("href")));
        //var src = await page.$$eval("ytd-grid-video-renderer.style-scope:nth-child("+i+") > div:nth-child(1) > ytd-thumbnail:nth-child(1) > a:nth-child(1) > yt-img-shadow:nth-child(1) > img:nth-child(1)", el => el.map(x => x.getAttribute("src")));
        var src2 = await page.evaluate('document.querySelector("ytd-grid-video-renderer.style-scope:nth-child('+i+') > div:nth-child(1) > ytd-thumbnail:nth-child(1) > a:nth-child(1) > yt-img-shadow:nth-child(1) > img:nth-child(1)").getAttribute("src")');


        href="https://www.youtube.com"+href;


        links.push({href,src2});
    }

    const result = await page.evaluate(() => {
        let viddata = []; // Create an empty array that will store our data
        let channelName = document.querySelector('ytd-channel-name.ytd-c4-tabbed-header-renderer > div:nth-child(1) > div:nth-child(1) > yt-formatted-string:nth-child(1)').innerHTML;

        var numvids =document.querySelector('div.ytd-grid-renderer:nth-child(2)').childElementCount;
        console.log("THERE ARE "+numvids+" VIDEOS");
        for (var i=1; i<numvids; i++){ // Loop through each video

            var title = document.querySelector('ytd-grid-video-renderer.style-scope:nth-child('+i+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > h3:nth-child(1) > a:nth-child(2)').innerHTML; 
            var views = document.querySelector('ytd-grid-video-renderer.style-scope:nth-child('+i+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > span:nth-child(1)').innerHTML;
            var date = document.querySelector('ytd-grid-video-renderer.style-scope:nth-child('+i+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > span:nth-child(2)').innerHTML;

            viddata.push({title,views,date,channelName});  
        }

        return viddata; // Return our data array
    });

    //merge href and src with other data
    for (var i=0; i<10; i++){
        result[i].links=links[i];
    }

    browser.close();
    return result; // Return the data
};


scrape().then((value) => {
    fs.writeFileSync("finalData.json", JSON.stringify(value));  
});