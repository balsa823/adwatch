const puppeteer = require('puppeteer');
const url = 'https://www.halooglasi.com/';

 
const searchButtonSelector = "button.ButtonSearch_search__nLSRu"
const searchInput = 'input#search-query'

const resultLengthSelector = 'div.BreadcrumbHolder_breadcrumb__KAsXr > span > div > span'

const nextPageButtonSelector = "a.page-link.next"
const resultSelector = '.market'

const itemNameSelector = ".product-title > a"
const itemPriceSelector= ".central-feature > span"
const itemDescriptionSelector= ".product-description"
const itemPublishDateSelector = ".publish-date"


const ho_run = async (keyword) => {
    const browser = await puppeteer.launch(`headless: "new"`)
    console.log("Launched")
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    await page.goto(url)
    console.log("Went to URL")

    await page.screenshot({ path: 'output/sc1.jpg' });

    console.log(`Typing ${keyword} type ${typeof(keyword)}`)

    await page.type(searchInput, keyword)
    await page.screenshot({ path: 'output/sc2.jpg' });

    console.log(`Typed ${keyword}`)

    await page.keyboard.press('Enter');
    console.log("Pressed enter")

    await page.screenshot({ path: 'output/sc3.jpg' });

    // await page.click(searchButtonSelector)

    try {
        await page.waitForSelector(resultSelector)
    } catch (error) {
        await browser.close();
        return []
    }

    const results = []
    while(true){

        const pageResults = await page.$$(resultSelector)

        console.log(pageResults.length)

        const parsed =  await Promise.all(pageResults.map( async r => {
            const item = {}

            item.name = await r.$eval(itemNameSelector, el => el.textContent)
            item.link = await r.$eval(itemNameSelector, el => el.href)
            item.price =   await r.$eval(itemPriceSelector, el => el.textContent)
            item.description =   await r.$eval(itemDescriptionSelector, el => el.textContent)

            item.publish_date =   await r.$eval(itemPublishDateSelector, el => el.textContent)

            console.log(item.name)
    
            return item
        }))

        results.push(...parsed)
        console.log(`Loaded Page Results ${results.length}`)


        const nextPageButton = await page.$(nextPageButtonSelector)

        if( !nextPageButton ) {
            console.log("Done")
            break
        }

        await nextPageButton.click()
        console.log("clicked")

        await page.waitForNavigation({ waitUntil: 'load' });
        await page.waitForSelector(resultSelector)


    }
    
    await browser.close();

    return results
}

module.exports = {
    ho_run
}
