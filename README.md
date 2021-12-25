# animate-earth-null

A Node.JS script to animate [earth.nullschool.net](https://earth.nullschool.net)

## Usage

- Make sure to install and configure [Chromium web driver](https://chromedriver.chromium.org/). The version of the web driver you download _must_ match the version of the Chrome you are using.

- Install the package dependencies

      npm install

- Edit `constants.mjs` depending on your needs. Get the values from URL of the browser with [earth.nullschool.net](https://earth.nullschool.net).

- Run the script

      npm run dev

- Go to the `processedDir` as in `constants.mjs` and run `ffmpeg` to stich the `png`s into video.

      ffmpeg -pattern_type glob -r 15 -f image2 -i "*.png" -vf "pad=ceil(iw/2)*2:ceil(ih/2)\*2" -vcodec libx264 -crf 25 -pix_fmt yuv420p test.mp4

## Gallery

Following are some of the animations that were made using this code. Most of them are used in [my blog](https://vinayakakv.com).

### PM2.5 levels all over the world (Dec 2020 - Dec 2021)

https://www.youtube.com/embed/L0015oonY-0

### PM2.5 levels over India (Dec 2020 - Dec 2021)

https://www.youtube.com/embed/aFHjcwZvLTI

## Contributing

Contributions are welcome, particularly in these areas:

- Currently the `console.log` of a particular string is used to detect completion of rendering event. A better way is required to do this.

- The stages (`scrape`, `preprocess`, `convert`) can all be done via `npm` package scripts.

- An `ffmpeg` wrapper could be used in `node` to make the process of `ffmpeg` readable and understandable

- More animation parameters could be explored -- Currently, animation happens only w.r.t time; anination in other axis (such as earth's rotation) could yield [some interesting results]().

- You add more!

## Thanks

- [earth.nullschool.net](earth.nullschool.net) for making amazing data available at fingertips, with zero-barrier to access.
- [@cambecc](https://github.com/cambecc) for creating it!

## Further Resources

- [Official earth.nullschool.net animations](https://www.facebook.com/EarthWindMap/videos) -- They are super cool and informative!
- [My blog about haze, using these animations](https://vinayakakv.com/blog/missing-mountains)
