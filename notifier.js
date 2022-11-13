import { default as axios } from "axios"
import {default as c} from "ansi-colors"
import { WindowsToaster } from "node-notifier"
import open from "open"
import lodash from "lodash" 
import path from "path"
import fs from "fs"
import cors from "cors-anywhere"

const port = 8080 // type any port you want
const host = '0.0.0.0'

cors.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, () => {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
})

const oldCatalogApi = `https://catalog.roblox.com/v1/search/items/details?Category=1&CreatorName=Roblox&SortType=3`
const catalogAPI = `https://catalog.roblox.com/v1/search/items/details?Category=1&CreatorName=Roblox&SortType=3&IncludeNotForSale`
const fileName = 'picture.png'
const mainFile_Name = 'notifier.js'
const mainFolder = path.basename(path.dirname(mainFile_Name))
let liczba = 0

const notifier = new WindowsToaster({
    withFallback: false,
    customPath: undefined
});

let oldData = {}
let SaveditemId = {}

const getApi = async (a) => {
    const resp = await axios.get(`http://localhost:8080/${a}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    },
    console.log("sent resp")
    )
    return resp.data.data
}
// --------------------download image-------------


    const downloadFile = async (a, b) => {


        const localFilePath = path.resolve(mainFolder, b, fileName)

        const resp = await axios({
            method: 'get',
            url: a,
            responseType: 'stream',
        });
        
        const w = resp.data.pipe(fs.createWriteStream(localFilePath));
        w.on('finish', () => {
            console.log('downloaded stuff');
        })
    }
// --------------------notifiier-------------

const notif = (notification) => {

    notifier.notify(notification);
    notifier.on('click', () => {
        open(`https://www.roblox.com/catalog/${SaveditemId}/`)
    })
}

// --------------------interval loop-------------

setInterval( async () => {
    const data = await getApi(catalogAPI)
    
    
    const itemName = data[0].name
    const itemPrice = data[0].price
    const itemId = data[0].id
    const desc = data[0].description
    const assetURL = `https://thumbnails.roblox.com/v1/assets?assetIds=${itemId}&size=420x420&format=Png&isCircular=false`
    
    const imageData = await getApi(assetURL)
    const imageURL = imageData[0].imageUrl
    
    
    if (!lodash.isEqual(oldData, data[0].name)){
        
        await downloadFile(imageURL, `tempIMG`)
        
        const notifData = {
            title: itemName,
            subtitle: `Price: ${itemPrice}`,
            message: desc,
            icon: `${mainFolder}\\tempIMG\\picture.png`,
            sound: true,
        }
        
        notif(notifData)
        
        oldData = `${data[0].name}`
        SaveditemId = `${itemId}`

    } else {
        console.log(`\n \n Recent: ${oldData} \n Link: ${c.green.bold.underline(`https://www.roblox.com/catalog/${SaveditemId}/`)} \n \n ${liczba}`);
        liczba += 1
    }

}, 5000 );
