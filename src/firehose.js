const Transport = require('winston-transport');
const AWS = require('aws-sdk');
const { MESSAGE } = require('triple-beam');

AWS.config.setPromisesDependency(Promise);

class FirehoseTransport extends Transport {
  constructor(options) {
    super(options);
    this.name = 'FirehoseLogger';

    const firehoseOptions = options.firehoseOptions || {};
    this.firehose = options.firehose || new AWS.Firehose({ region: firehoseOptions.region });
    this.streamName = options.streamName;
  }

  log(info, callback) {
    if (callback) {
      setImmediate(callback);
    }
    const message = info[MESSAGE];
    this.send(message);
  }

  send(message) {
    const params = {
      DeliveryStreamName: this.streamName,
      Record: {
        Data: message,
      },
    };
    return this.firehose.putRecord(params).promise();
  }
}

module.exports = FirehoseTransport;
