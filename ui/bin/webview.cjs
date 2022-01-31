#!/usr/bin/env node
const { URL } = require('url'); 
const gi = require('node-gtk');
const gtk = gi.require('Gtk', '3.0');
const gdk = gi.require('Gdk', '3.0');
const webkit = gi.require('WebKit2');
const yargs = require('yargs/yargs');
const IPCClient = require('@no.de/ipc');
const { hideBin } = require('yargs/helpers');
const { argv } = yargs(hideBin(process.argv));

setTimeout(start, 1000);

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

  const ipc = new IPCClient(['wm','ui']);
  ipc.on('ui', data => {
    const { command, window, url } = data;
    if (window !== title) return;
    const webview_url = new URL(web.getUri());
    webview_url.pathname = url;
    if (command === 'update-url') {
      web.loadUri(webview_url.href);
    }
  });

  win.setVisual(visual);
  win.add(web);
  win.on('show', () => gtk.main());
  win.on('destroy', gtk.mainQuit);
  win.showAll();

}
