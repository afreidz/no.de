const screen = require('../../screen');

screen.mockImplementation(() => {
  return Promise.resolve([{
    i: 0,
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  }, {
    i: 1,
    x: 100,
    y: 0,
    w: 100,
    h: 100,
  }]);
});

jest.mock('../../screen');

module.exports = screen;