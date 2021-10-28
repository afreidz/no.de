#!/usr/bin/env node
import Logger from 'spice-logger';
import Manager from './lib/manager.js';

const manager = await (new Manager());