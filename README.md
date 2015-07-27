# tf-js

Create tables with pagination and filter functions.

## Features
* Filter by Dropdown and Fulltext-Search
* Pagination (mobile and full)
* Auto page switch

## Requirements
```
jQuery > 1.9
```

## Configuation Variables
* data-pagination: 
Elements per page on a normal webpage (width > 840)
* data-repsonsive: 
Elements per page on a mobile webpage (width <= 840)
* data-autorotate: 
If set then rotation in seconds
* data-switches
Disable (data-switches="0") oder enable (data-switches="1") next / previous switches
* data-anchor
Set data-anchor=1 to add an hash anchor to the URL.
* data-animation
Set data-animation = 1 to enable an scroll animation

## Add Custom Switches
Add the class "tf-pagination-switch-move" to your custom switch div / img / etc. Add also the attribute "data-direction" with the value -1 for previous and +1 for next.

## Change Log

0.3 > 0.4
* scroll animation
* smooth height reduce
* row color starts new on every page
* anchors
* fixes

## Demo

http://ruditherednose.gohl.tk/tf-js/example/index.html

