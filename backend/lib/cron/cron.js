import cron from 'cron'
import https from 'https'

const job = new cron.CronJob("*/14 * * * *", function () {
    https.get(process.env.API_URL, (res) => {
        if (res.statusCode === 200) {
            console.log("Get request sent successfully")
        } else {
            console.log("Get request failed", res.statusCode)
        }
        console.log("Cron job executed")
    })
        .on('error', (err) => {
            console.log("Error while sending request ", err)
        })
})

export default job