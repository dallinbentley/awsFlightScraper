# awsFlightScraper
A serverless Google Flights scraper that runs on Node using the Serverless framework.

Here you will find multiple folders that have a serverless scraper using AWS.  Initially, this was built in Python using the Selenium Library, but it was much easier to build
using the Puppeteer library in Node.  If you have any questions about how it runs, let me know.

The trickiest part is getting Headless Chrome into Lambda...  This <a href="https://www.purplesquirrels.com.au/2019/10/getting-headless-chrome-to-run-on-aws-lambda-node/> article </a> from Purple Squirrels was extremely helpful.
