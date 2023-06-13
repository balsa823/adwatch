const puppeteer = require('puppeteer');
const url = 'https://novi.kupujemprodajem.com/';

 
const searchButtonSelector = 'button.ButtonSearch_search__nLSRu'
const searchInput = 'input#keywords'

const resultLengthSelector = 'div.BreadcrumbHolder_breadcrumb__KAsXr > span > div > span'

const nextPageButtonSelector = "a.Pagination_buttonNext__yzVN_"
const resultSelector = 'section.AdItem_adOuterHolder__i2qTf'

const itemNameSelector = "div.AdItem_name__RhGAZ"
const itemPriceSelector= "div.AdItem_price__jUgxi"
const itemPostedStatusSelector = "div.AdItem_postedStatus__swUhG"

const log = (req) => {
    console.log('A request was made: ', req.url())
}

const keyword = process.argv[2]

const run = async (keyword) => {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    //page.on('request', log);

    await page.goto(url)

    await page.type(searchInput, keyword)
    await page.click(searchButtonSelector)

    await page.waitForSelector(resultSelector)


    // Fetches number of postings

    // const spans = await page.$$eval(resultLengthSelector, spans => {
    //     return spans.map(span => span.textContent);
    // })
    // const result_lenght = spans[1]

    const results = []

    while(true){

        const pageResults = await page.$$(resultSelector)

        const parsed =  await Promise.all(pageResults.map( async r => {
            const item = {}
    
            item.name = await r.$eval(itemNameSelector, el => el.textContent)
            item.price =   await r.$eval(itemPriceSelector, el => el.textContent)
            item.posted_status =   await r.$eval(itemPostedStatusSelector, el => el.textContent)
    
            return item
        }))

        results.push(...parsed)

        const nextPageButton = await page.$(nextPageButtonSelector)

        if( !nextPageButton ) {
            break
        }

        await nextPageButton.click()

        await page.waitForSelector(resultSelector)

    }
    
    await browser.close();

    return results
}

module.exports = {
    run
}
