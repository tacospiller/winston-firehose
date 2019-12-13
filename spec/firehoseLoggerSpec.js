const winston = require('winston');
const FirehoseTransport = require('../src/index.js');

let firehose;
let message;

describe('firehose transport', function () {
  beforeEach(function () {
    firehose = {
      putRecord: jasmine.createSpy().and.returnValue({ promise: () => Promise.resolve() }),
    };
    message = 'test message';
  });

  it('sends message to firehose', function (done) {
    const transport = new FirehoseTransport({ firehose });
    transport.send(message)
    .then(() => {
      expect(firehose.putRecord).toHaveBeenCalledTimes(1);
      done();
    })
    .catch((ex) => {
      fail(ex);
      done();
    });
  });

  it('affixes to winston', function () {
    const logger = winston.createLogger({
      transports: [
        new FirehoseTransport({ level: 'info', firehose }),
      ],
    });

    logger.info(message);
    expect(firehose.putRecord).toHaveBeenCalledTimes(1);
  });
});
