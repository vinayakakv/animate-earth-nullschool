import { eachHourOfInterval, formatRFC3339, format } from "date-fns"
import { existsSync } from "fs"
import * as fs from "fs/promises"
import * as path from "path"
import jimp from "jimp"
import { Builder } from "selenium-webdriver"
import { Options } from "selenium-webdriver/chrome.js"

import constants from "./constants.mjs"

const {
  baseUrl,
  start,
  end,
  outputDir,
  processedDir,
  stepInHours,
  projection,
  layer,
} = constants

let generateUrl = ({ year, month, day, hour, minute }) => {
  const options = { minimumIntegerDigits: 2, useGrouping: false }
  const fixedHour = hour.toLocaleString("en-US", options)
  const fixedMinute = minute.toLocaleString("en-US", options)
  return `${baseUrl}/#${year}/${month}/${day}/${fixedHour}${fixedMinute}Z/${layer}/orthographic=${projection}`
}

let intervals = eachHourOfInterval({ start, end }, { step: stepInHours })

const driver = new Builder()
  .forBrowser("chrome")
  .setLoggingPrefs({ browser: "ALL" })
  .setChromeOptions(
    new Options().addArguments(["--window-size=1920,1080", "--hide-scrollbars"])
  )
  .build()

const outputDirExists = existsSync(outputDir)
if (!outputDirExists) {
  fs.mkdir(outputDir)
}

let fileNames = []
for await (const interval of intervals) {
  const date = new Date(interval)
  const fileName = path.join(outputDir, `${formatRFC3339(interval)}.png`)
  fileNames.push(fileName)
  const exists = existsSync(fileName)
  if (exists) {
    // File exists
    console.log(`Skipping ${fileName}`)
    continue
  }
  await driver.get(
    generateUrl({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
    })
  )
  await driver.wait(async () => {
    const logs = await driver.manage().logs().get("browser")
    const loadingFinished = logs.some(log =>
      log.message.includes("interpolating field:")
    )
    return loadingFinished
  })
  const screenshot = await driver.takeScreenshot()
  console.log(`Writing ${fileName}`)
  await fs.writeFile(fileName, Buffer.from(screenshot, "base64"))
}

await driver.quit()

const processedDirExists = existsSync(processedDir)
if (!processedDirExists) {
  fs.mkdir(processedDir)
}

let i = 0
for await (let fileName of fileNames) {
  const index = i.toLocaleString("en-US", {
    minimumIntegerDigits: 4,
    useGrouping: false,
  })
  i += 1
  const processedFileName = `${index}.png`
  const processedFilePath = path.join(processedDir, processedFileName)
  if (existsSync(processedFilePath)) {
    console.log(`Skipping processing ${fileName}; ${processedFileName} exists.`)
    continue
  }
  console.log(`Processing ${fileName}`)
  const date = new Date(fileName.split("/").at(-1).split(".")[0])
  const caption = format(date, "dd-MM-yyyy")
  const file = await jimp.read(fileName)
  const font = await jimp.loadFont(jimp.FONT_SANS_64_WHITE)
  file.print(font, file.getWidth() * 0.7, file.getHeight() * 0.9, caption)
  await file.writeAsync(processedFilePath)
}
