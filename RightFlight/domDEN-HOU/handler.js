const chromium = require("chrome-aws-lambda");
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var data = [];
var todayDate = new Date();
var today = todayDate.getFullYear()+'-'+(todayDate.getMonth()+1)+'-'+todayDate.getDate();

var airports = ['DEN','DTW','EWR','FLL','FSD','HNL',];

var average_prices = {'DEN':[133],
                    'DTW':[155],
                    'EWR':[252],
                    'FLL':[150],
                    'FSD':[322],
                    'HNL':[620],
                    };

var todayCount = new Date(todayDate.setMonth(todayDate.getMonth() + 1));
var fiveDays;
var dates = [];
var range = [];

for (let monthCount = 0; monthCount < 50; monthCount++) {
    range = [];
    if ((todayCount.getMonth() + 1 < 10) && (todayCount.getDate() < 10))  {
        range.push(todayCount.getFullYear()+'-0'+(todayCount.getMonth()+1)+'-0'+todayCount.getDate());
    }
    else if ((todayCount.getDate() < 10)) {
        range.push(todayCount.getFullYear()+'-'+(todayCount.getMonth()+1)+'-0'+todayCount.getDate());     
    }
    else if ((todayCount.getMonth() + 1 < 10)) {
        range.push(todayCount.getFullYear()+'-0'+(todayCount.getMonth()+1)+'-'+todayCount.getDate());     
    }
    else {
        range.push(todayCount.getFullYear()+'-'+(todayCount.getMonth()+1)+'-'+todayCount.getDate());
    }
    fiveDays = new Date(todayCount.setDate(todayCount.getDate() + 5));
    if ((fiveDays.getMonth() + 1 < 10) && (fiveDays.getDate() < 10))  {
        range.push(fiveDays.getFullYear()+'-0'+(fiveDays.getMonth()+1)+'-0'+fiveDays.getDate());
    }
    else if ((fiveDays.getDate() < 10)) {
        range.push(fiveDays.getFullYear()+'-'+(fiveDays.getMonth()+1)+'-0'+fiveDays.getDate());     
    }
    else if ((fiveDays.getMonth() + 1 < 10)) {
        range.push(fiveDays.getFullYear()+'-0'+(fiveDays.getMonth()+1)+'-'+fiveDays.getDate());     
    }
    else {
        range.push(fiveDays.getFullYear()+'-'+(fiveDays.getMonth()+1)+'-'+fiveDays.getDate());
    }
    todayCount = new Date(fiveDays.setDate(fiveDays.getDate() + 1));
    dates.push(range);
}

module.exports.scrape = async (event, context) => {

    for(let airport of airports) {
        try {
            var count = 1;
                try {
                    for(let date of dates) {
                        const url = `https://www.google.com/flights?hl=en#flt=DFW.${airport}.${date[0]}*${airport}.DFW.${date[1]};c:USD;e:1;sd:1;t:f`;
                        // console.log(url);
                        const browser = await chromium.puppeteer.launch({
                            headless: true,
                            executablePath: await chromium.executablePath,
                            args: chromium.args
                        });
                        const page = await browser.newPage();
                
                        await page.goto(url);
                        // console.log('URL loaded correctly');
                
                        await page.waitForSelector('div.POX3ye > div.FpEdX > span');
                        // console.log('The pages has waited.');
                
                        const prices = await page.$$('div.POX3ye > div.FpEdX > span');
                        // console.log('prices',prices.length);
                        
                
                        for(const price of prices) {
                            let cost = await page.evaluate(price => price.textContent, price);
                                                
                            if(cost.includes(',')){
                                cost = cost.replace(',', '');
                            }
                            
                            cost =  await parseInt(cost.substring(1));
                            
                            let savings = await (1 - (cost/average_prices[airport][0]));
                            // data.push(`${count} ${date[0]} DFW -> ${airport}: ${cost} average price: ${average_prices[airport][0]} % savings: ${savings.toFixed(2)}`);
                                
                            var params = {
                                TableName: 'Flights',
                                Item: {
                                    'FlightKey': {S: today + airport + String(count)},
                                    'ScrapeDate': {S: today},
                                    'DepartureDate': {S: date[0]},
                                    'Airport': {S: airport},
                                    'Price': {N: String(cost)},
                                    'Savings': {N: savings.toFixed(2)},
                                    'International':{N: '0'},
                                }
                            };
                            
                                ddb.putItem(params, function(err, data) {
                                if (err) {
                                    console.log("Error", err);
                                } else {
                                    console.log("Success", data);
                                }
                                });
                                
                                count = count + 1;
                            }
                        browser.close();
                    }
                }
                catch(err) {
                    console.log("The date was likely out of range.")
                }
        }
        catch(err) {
            console.log("There was a problem with the Airport.")
        }
    }
    //return data;
};