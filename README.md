## no.de (A nodejs X11 Desktop Environment)

### Background
_What?_ This (eventually) will/may become a full desktop environment for a Linux machine written in javascript.
It is based on X11 (no wayland, sorry).  It will/may include the following DE elements:
* [ ] Login/Session
* [x] Tiling window management
* [x] Desktop
* [ ] Application launching
* [ ] Screen locking

_Why?_ I don't really have a great answer for that.  Maybe because I know javascript and wanted to have control
of the "graphical" parts of my OS.

### Concepts/Packages

* #### ipc
_Inter-process communication_ is handled via [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).
Clients are created with scopes they are interested in. A central server reacts to messages and routes them to 
appropriate clients based on the scope of the message.

* #### cli
_Command line interface_ is tool that is used to manage startup.  It also serves as a way to initiate ipc calls 
in bash/zsh.

* #### hkd
_Hot-key daemon_ is handled by [sxhkd](https://github.com/baskerville/sxhkd) (the package bspwm uses) to configure 
keybindings. This can be used in conjunction with the cli/ipc to issue commands to the window manager. The 
configuration for no.de includes keybinds that are used to auto-generate a `sxhkdrc` file.

* #### compositor
_picom_ is the package that handles X window compositing.  The `picom` file is loaded with the configuration
settings on startup.  This may be eventually become part of the config json file and auto-generated.  It can
also be disabled in the config.

* #### ui
_User interface elements_ are a few goodies to enhance the environment. 1 example is the "desktop" which
is a web page that handles a top bar and wallpaper.  The stack behind the scenes is [svelte](https://svelte.dev) 
and [svelte-kit](https://kit.svelte.dev) with [node-gtk](https://github.com/romgrk/node-gtk) (and webkit2gtk) 
used to spawn the web page in an X window.  This, and any additional UI can be disabled in the config.

* #### wm
_Window manager_ is the biggest portion of this environment.  It is an X11 tiling window manager written
leveraging the [node-x11](https://github.com/sidorares/node-x11) package. As applications request to be drawn, 
the window manager will lay them out in a tile algorithm.  It also handles "workspaces" on each screen to give 
further control of when/where windows appear. It has the following features:

  * [x] workspace add
  * [ ] workspace delete
  * [x] window launching
  * [x] window kill
  * [x] floating windows
  * [x] fullscreen windows
  * [x] switch workspace
  * [x] move to workspace
  * [x] cycle workspace
  * [x] flip layout
  * [x] move window within workspace
  * [x] resize window ratios


### <a name="prereq"></a>Prerequisites
Okay so here is where things stat to get wonky.  Right now this is in very early development so there are a
lot of assumptions and pre-reqs.  Hopefully many of these will be removed as I find better ways to handle
things, but for now your system has to be setup JUST so in order for this to work.  I will try to lay it all
out here:
  * use **Arch linux** (btw). I have set this up and had it work on 2 separate Arch machines. Beyond that its
  totally YMMV.
  * **nodejs/npm** This may seem obvious, but I'm sure it will cause some raised eyebrows.  Importantly, you
  should be on `node@v14.x` and `npm@v7.x`.  I recommend [volta](https://volta.sh) to manage node/npm versions.
  * **google/zx** this is an [npm package](https://github.com/google/zx) from the folks at Google that helps 
  with cli writing.  It works best when installed globally via `npm i -g zx`.  Its a local dependency of the cli 
  tool already, so there is an opportunity to improve this out of being a "pre-requisite" in the future.
  * **linux packages** the following Arch packages are required:
    * xorg-server
    * xorg-apps
    * xorg-xinit
    * gtk3
    * webkit2gtk
    * picom (or some fork ... ibhagwan or the like)
    * sxhkd
    * cairo
    * gobject-introspection
    * base-devel
    * git

```
 yay -S --needed \
  git \
  gtk3 \
  sxhkd \
  cairo \
  webkit2gtk \
  base-devel \
  xorg-server \
  xorg-apps \
  xorg-xinit \
  picom-ibhagwan-git \
  gobject-introspection 
```

### Installation
* finish [prerequisites](#prereq)
* clone this repo
* run `npm install` from the repo dir to install npm deps
* configure it by creating `no.de.config.json` in the root [example](https://github.com/afreidz/no.de/blob/main/no.de.config.json.example)
* run `npm link` from the repo dir to make `no.de` cmd available
* run `no.de init` to start it all up
