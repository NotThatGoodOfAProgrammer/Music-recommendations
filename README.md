# Music recommendations

### [View website](https://karmatys8.github.io/Music-recommendations)

### Built on Spotify API

### Hosted on GitHub Pages

## Description:

Main purpose of this project was to learn React, fetching from APIs and how to use Git and GitHub.
Developed with Mobile First Design. Idea sparked out while reading APIs features
and recalling frustration from mismatched Spotify recommendations.<br>

## The most crucial techniques that I have improved at/learned are:

* React components and states
* Fetching
* Data processing
* Git commands and terminal usage in general
* CSS pseudo-classes
* Writing README.md files
* Projects file structure

## How to use guide:

0. *Only once* I have to add you to my Projects user list, else Spotify will throw error 403 if you interact with anything. Message me e-mail that you use for Spotify and optionally your full name
1. Click on "Get token" and login with Spotify account
2. Choose what type you are looking for in filters
3. *Optional* Select date release and/or genres in filters
4. Type in a name of what you are looking for
5. Click on submit button
6. Browse through results and find the one you are looking for
7. Click the plus button on selected result
8. Add more results if you wish to*
9. Press button in top left corner
10. *Optional* Add genres*
11. Click on "See results" and enjoy **Music recommendations**

\* *only up to 5 results and genres combined can be choosen at once*

## Possible issues

* Filtering by tag:new(releases from past 2 weeks) seems not to work with genres. [Read more.](https://community.spotify.com/t5/Spotify-for-Developers/API-No-way-to-search-tag-new-with-genre/td-p/5483721)

## Further improvements

* Spotify uses HTTP/1.1 instead of HTTP/2
* Can't change neither format of images nor their size from Spotifys response. There are some APIs that can do the later however, their either to [slow](https://rapidapi.com/jdiez/api/mediacrush/pricing) [(2nd link)](https://www.filestack.com/pricing/#/marketplace) or have [too low of a limit](https://www.abstractapi.com/api/image-processing-optimization-api#pricing) to be beneficial. There is also [proxy](https://imgproxy.net/#pro) option but I still would have to invest time/money into it.
* There is a lot of main-thread work being done. Most of it is what lighthouse classifies as "Other". Not really sure how to tackle this problem. [Only clue.](https://github.com/GoogleChrome/lighthouse/issues/11478)
* Total Blocking Time is high from what seems expensive animations and rendering. But it would take a lot of effort to fix it and I have not found it disturbing.

**Note:** "Tablet and desktop design" branch is left on purpose for nostalgic purposes.

## Credits:
Color palette from Spotify<br>
Images and icons from https://www.freepik.com/<br>