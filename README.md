# Music recommendations

Built on Spotify API

## Still in build

To do:
1. Checking google lighthouse for possible improvements
2. *Maybe* Changing window.alert() to  custom notification box


## Link: https://NotThatGoodOfAProgrammer.github.io/Music-recommendations

## Description:

Main purpose of this project was to learn React, fetching from APIs and how to use Git and GitHub.
Developed with Mobile First Design. Idea sparked out while reading APIs features
and recalling frustration from mismatched Spotify recommendations.<br>
**Note:** "Tablet and desktop design" branch is left on purpose.

## The most crucial techniques that I have improved at/learned are:

1. React components and states
2. Fetching
3. Data processing
4. Git commands and terminal usage in general
5. CSS pseudo-classes
6. Writing README.md files
7. Projects file structure

## How to use guide:

0. *Only once* I have to add you to my Projects user list, else Spotify will throw error 403 if u interact with anything. Message me e-mail that you use for Spotify and optionally your full name
1. Click on "Get token" and login with Spotify account
2. Choose what type you are looking for in filters
3. *Optional* Select date release and/or genres in filters
4. Type in name of what you are looking for
5. Click on submit button or press enter in search bar
6. Browse through results and find the one you are looking for
7. Click the plus button on selected result
8. Add more results if you wish to*
9. Press button in top right corner
10. *Optional* Choose genres*
11. Click on "See results" and enjoy **Music recommendations**

\* *only up to 5 results and genres combined can be choosen at once*

## Possible issues

* releases from past 2 weeks(tag:new) seems not to work with genres [read more](https://community.spotify.com/t5/Spotify-for-Developers/API-No-way-to-search-tag-new-with-genre/td-p/5483721)

## Furher improvments

1. Spotify uses HTTP/1.1 instead of HTTP/2
2. Can't change neither format of images nor their size from Spotifys response. There are some APIs that can do the later however, their either to [slow](https://rapidapi.com/jdiez/api/mediacrush/pricing) [(2nd link)](https://www.filestack.com/pricing/#/marketplace) or have [too low of a limit](https://www.abstractapi.com/api/image-processing-optimization-api#pricing) to be beneficial. There is also [proxy](https://imgproxy.net/#pro) option but I still would have to invest time/money into it.
3. There is a lot of main-thread work being done. While I could probably improve rendering a bit there is what lighthouse classifies as "Other" that is taking up most of the time. Not really sure how to tackle this problem.
4. Total Blocking Time is high from what it seems expensive animations and rendering. But it would take a lot of effort to fix it and I didn't find it disturbing.

## Credits:
Color palette from Spotify<br>
Images and icons from https://www.freepik.com/<br>