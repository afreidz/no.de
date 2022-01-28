## no.de (A nodejs X11 Desktop Environment)

### Background
_What?_ This (eventually) will/may become a full desktop environment for a Linux machine written in javascript.
It is based on X11 (no wayland, sorry).  It will/may include the following DE elements:
* [ ] Login/Session
* [x] Tiling window management
* [x] Desktop
* [ ] Application launching
* [ ] Screen locking
* [ ] Notifications

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

---

### Window Manager In-depth

The biggest portion of this Dekstop Environment is the window manager.  It can be considered a tiling window manager
in that when an app/window requests to be opened, the manager lays it out using a (stupid simple) algorithm 
that does not overlap with other windows.  Other windows are resized/reoriented to make room on the screen for the new
window. There are plenty of other tiling window manager (many with far more sophisticated algorithms) but this one I
developed to suite my personal taste/needs.  In addition to tiling, windows can be opened/converted to a more traditional
floating window (and also a "fullscreen" window) that takes them out of the tiling flow.  Below are further details of the
main concepts behind the window manager:

* **The manager class** is instantiated
with pixel dimensions for the entire screen real-estate to be managed. It also takes an array of "screens" that divide the 
entire real-estate into areas where "workspaces" can exist. You can think of them as trandition screens (and their position
/dimensions), but by itself, the manager is agnostic of what is used to actually render anything to screen.  
An **adapter** is used to supplement the manager class with "rendering" capabilities. In the case of no.de's window manager, 
X11 (via node-x11) protocols are used to render entities onto the xorg-server screen. For instantiating the manager class 
with the xorg adapter, an abstraction of xrandr is used to calculate the pixel real-estate to be managed (including multiple 
heads) and the screens for where workspaces exist.

* **The root container** is a type of container that simply stores the cumulative pixel dimensions, and screens that were used
when the manager was created.  The manager functions _could_ be added to this root container, but I felt it was better to
abstract the management to a separate concept and keep all container-like objects as simple as possible.  The root can be
considered the terminal node from which all other nodes descend from.

* **The workspace container** is a familiar concept to many window managers and desktop environments.  It is essentially a virtual
desktop that can be used to contain windows in an isolated geometry (in this case the position and dimensions of an attached screen).
Workspaces are instantiated with, and can have a many-to-one relationship with, a screen.  However, only 1 workspace may be "active"
on a screen at a time. They also can be instantiated with a
concept known as a "strut" which is a means to offset all windows by a certain amount of pixels from the edges of the workspace. A 
use-case for struts is if a bar/dock is occupying certain real-estate that windows should not render on top of. Workspaces also have
a direction property of either "ltr" or "ttb".  These values tell the layout algorithm to render workspace children either top-to-bottom
("ttb") or left-to-right ("ltr"). All workspaces are children of the root container and can have 1 type of child themselves: 
a **section container**

* **The section container** is fairly irrelevant in terms of rendering anything. But the concept exists to make the layout algorithm 
more easy to understand. If a workspace has a direction of "ltr", then windows will be added to sections and rendered left-to-right.
Conversely, if a workspace dir is set to "ttb", then section containers layout their children top-to-bottom. A section can only be 
a child of a workspace, and can only take window containers as it children. Sections are the concept that drives the layout algorithm 
and are responsible for disecting the layout real-estate on the oposite axis of the workspace direction. This is accomplished by 
adding an additional section to a workspace.  When a subsequent section is added to a workspace, it is laid out opposite the workspace 
direction setting.  This is called a "split."  When a window requests to open in a split, a new section is created, added to the current
workspace, and the window is rendered into it.  This breaks the workspace direction flow. Any additional windows that ask to render in 
the new section will respect the dir setting of the workspace like any other section.  This concept may seem slightly terse in word-form
but makes the layout algorighm fairly simple.  It may have far less options than many other tiling algorithms other window managers use,
but I think you will find there are a fair amount of layouts that can be achieved with these concepts.  The only other function of a 
section container is to add the "outer gap" for creating space between windows similar to i3wm-gaps.  The "inner gap" is controled by 
the window container itself

* **The window container** is the final piece to the layout puzzle.  This container is simple and doesn't have much implementation beyond
setting the inner-gap and being a referential element to whichever **adapter** is being used to render content to screen.  In the case 
of no.de's xorg adapter, the id of the window container is the xid of the xwindow that is being mapped.  A window container must be a child 
of a section container, and has no children of its own. Once a window is present, its geometry (which is the key function of the base 
container class these concepts inherit from) can be fed to the X11 client which will handle resizing/moving/mapping the window on screen.
The window container instance itself does not have an insight into the application that is being rendered, but is purely conceptual and 
used to feed geometry to the X11 client. 

* **Notes**
    * Bare minimum, the manager needs a root, a workspace, a section in order to create an instance of a window to get geometry for rendering
    * To add additional layouts, a workspace can be "flipped" to render in the opposite direction (ttb/ltr)

