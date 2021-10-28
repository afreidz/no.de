#!/usr/bin/env node
const gi = require('node-gtk');
const gtk = gi.require('Gtk', '3.0');
const gdk = gi.require('Gdk', '3.0');
const webkit = gi.require('WebKit2');
const id = process.argv[2] || +new Date();

gi.startLoop();
gtk.init();

const win = new gtk.Window({
  title: `desktop_${id}`
});

const web = new webkit.WebView();
web.loadUri('https://google.com');

win.add(web);
win.on('show', () => gtk.main());
win.on('destroy', gtk.mainQuit);
win.showAll();
win.addEvents(gdk.EventMask.KEY_PRESS_MASK | gdk.EventMask.KEY_RELEASE_MASK);