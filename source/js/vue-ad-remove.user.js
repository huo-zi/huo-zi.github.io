// ==UserScript==
// @name         vue ad remove
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       huozi
// @include      https://cn.vuejs.org/*
// @match        https://cn.vuejs.org/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var gg = document.getElementById('sidebar-sponsors-special');
    gg.parentNode.removeChild(gg);
    // Your code here...
})();