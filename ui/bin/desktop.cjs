#!/usr/bin/env node
const gi = require('node-gtk');
const { join } = require('path');
const gtk = gi.require('Gtk', '3.0');
const gdk = gi.require('Gdk', '3.0');
const webkit = gi.require('WebKit2');
const { pathToFileURL } = require('url');
const id = process.argv[2] || +new Date();

const priority = gtk.STYLE_PROVIDER_PRIORITY_APPLICATION;
const styles = new gtk.CssProvider();

gi.startLoop();
gtk.init();

const page = join(__dirname, '../build/desktop/index.html');

const win = new gtk.Window({
  title: `desktop_${id}`
});

const screen = win.getScreen();
const visual = screen.getRgbaVisual();
const rgba = new gdk.RGBA({ red: 0, green: 0, blue: 0, alpha: 0 });

const web = new webkit.WebView();
web.loadUri('http://localhost:7000/desktop');
web.setBackgroundColor(rgba);

win.setVisual(visual);
win.add(web);
win.on('show', () => gtk.main());
win.on('destroy', gtk.mainQuit);
win.showAll();