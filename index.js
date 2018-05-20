var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var Benchmark = require('benchmark');
var beauty = require('beautify-benchmark');

var createArray = function (count) {
  var array = _.times(count, function() { return true; });
  return array;
};

var benchmarks = {
  'for': function (count) {
    var array = createArray(count);
    return {
      fn() {
        for (var i = 0; i < count; i++) {};
      },
    };
  },
  'for-in': function (count) {
    var array = createArray(count);
    return {
      fn() {
        for (var i in array) {}
      },
    };
  },
  'for-of': function (count) {
    var array = createArray(count);
    return {
      fn() {
        for (var f of array) {}
      },
    };
  },
  'forEach': function (count) {
    var array = createArray(count);
    return {
      fn() {
        array.forEach(function(f) {});
      },
    };
  },
  '_.forEach (npm: lodash)': function (count) {
    var array = createArray(count);
    return {
      fn() {
        _.forEach(array, function(f) {});
      },
    };
  },
  'while': function (count) {
    return {
      fn() {
        var i = 0;
        while (i < count) {
          i++;
        }
      },
    };
  },
};

var createSuite = function (benchmarks, count) {
  var suite = new Benchmark.Suite();
  for (var t in benchmarks) suite.add(t, benchmarks[t](count));
  return suite;
};

var createSuites = function (benchmarks) {
  return {
    '10 items': createSuite(benchmarks, 10),
    '100 items': createSuite(benchmarks, 100),
    '250 items': createSuite(benchmarks, 250),
    '500 items': createSuite(benchmarks, 500),
    '1000 items': createSuite(benchmarks, 1000),
    '5000 items': createSuite(benchmarks, 5000),
    '10000 items': createSuite(benchmarks, 10000),
  };
};

var suites = createSuites(benchmarks);

var launch = function (suites) {
  async.eachSeries(
    _.keys(suites),
    function (suiteName, next) {
      console.log(suiteName);
      suites[suiteName].on('cycle', function (event) { beauty.add(event.target); });
      suites[suiteName].on('complete', function (event) {
        beauty.log();
        next();
      });
      suites[suiteName].run({ async: true });
    }
  );
};

module.exports = {
  benchmarks,
  createSuite,
  createSuites,
  suites,
  launch,
};
