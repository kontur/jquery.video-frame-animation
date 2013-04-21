jquery.video-frame-animation
============================

jQuery plugin for animating a video frame sequence based on scroll position


WIP
===

Basic animation demo working, but without preloading


TODO's / Feature wish list
==========================

- limited img elements in the DOM, buffering by creating <img> elements only
  x frames ahead (currently the plugin just creates a <img> element for every 
  frame supplied)
- decoupling from window scroll event -> implementing custom function
  listener that can define the 0-100% frames animation range in any
  way
- methods for playing the animation (back and forth) programmatically
- proper preloading / forced or dynamic preloading switch
- smoother transition to high resolution images
- implement events for: preloading, scrolling, scrolling finished, 
  high resolution image loaded, etc.
- dynamic prefetching of high resolution images when low resolution
  images are all loaded