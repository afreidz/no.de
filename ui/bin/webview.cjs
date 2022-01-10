#!/usr/bin/env node
const gi = require('node-gtk');
const gtk = gi.require('Gtk', '3.0');
const gdk = gi.require('Gdk', '3.0');
const webkit = gi.require('WebKit2');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { argv } = yargs(hideBin(process.argv));

setTimeout(start, 2000);

function start() {
  const priority = gtk.STYLE_PROVIDER_PRIORITY_APPLICATION;
  const title = argv.title || `webview_${+new Date}`;
  const styles = new gtk.CssProvider();
  const url = argv.url;

  gi.startLoop();
  gtk.init();

  const win = new gtk.Window({ title });

  const screen = win.getScreen();
  const visual = screen.getRgbaVisual();
  const rgba = new gdk.RGBA({ red: 0, green: 0, blue: 0, alpha: 0 });

  const web = new webkit.WebView();
  web.loadUri(url);
  web.setBackgroundColor(rgba);
  web.overrideBackgroundColor(0, rgba);

  win.setVisual(visual);
  win.add(web);
  win.on('show', () => gtk.main());
  win.on('destroy', gtk.mainQuit);
  win.showAll();
}
