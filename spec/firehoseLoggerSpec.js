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

  it('sends message to firehose', function () {
    const transport = new FirehoseTransport({ firehose });
    transport.send(message);
    expect(firehose.putRecord).toHaveBeenCalledTimes(1);
  });

  it('uses right stream name', function () {
    const transport = new FirehoseTransport({ firehose, streamName: 'test-firehose-stream' });
    transport.send(message);
    expect(firehose.putRecord).toHaveBeenCalledWith({
      DeliveryStreamName: 'test-firehose-stream',
      Record: jasmine.any(Object),
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

  it('uses logger level', function () {
    const transport = new FirehoseTransport({ firehose });
    spyOn(transport, 'send');
    const logger = winston.createLogger({
      level: 'warn',
      transports: [
        transport,
      ],
    });
    logger.info(message);
    expect(transport.send).not.toHaveBeenCalled();
    logger.warn(message);
    expect(transport.send).toHaveBeenCalled();
  });

  it('uses logger format', function () {
    const transport = new FirehoseTransport({ firehose });
    spyOn(transport, 'send');
    const logger = winston.createLogger({
      format: winston.format.simple(),
      transports: [
        transport,
      ],
    });
    logger.warn(message);
    expect(transport.send).toHaveBeenCalledWith('warn: test message');
  });
});
