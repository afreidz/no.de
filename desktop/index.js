#!/usr/bin/env node
const gi = require('node-gtk');
const { join } = require('path');
const gtk = gi.require('Gtk', '3.0');
const gdk = gi.require('Gdk', '3.0');
const webkit = gi.require('WebKit2');
const { pathToFileURL } = require('url');
const id = process.argv[2] || +new Date();

gi.startLoop();
gtk.init();

const page = join(__dirname, 'index.html');

const win = new gtk.Window({
  title: `desktop_${id}`
});

const web = new webkit.WebView();
web.loadUri(pathToFileURL(page));

win.add(web);
win.on('show', () => gtk.main());
win.on('destroy', gtk.mainQuit);
win.showAll();
win.addEvents(gdk.EventMask.KEY_PRESS_MASK | gdk.EventMask.KEY_RELEASE_MASK);