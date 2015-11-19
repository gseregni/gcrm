'use strict';

describe('Service: HighRise', function () {

  // load the service's module
  beforeEach(module('galimbertiCrmApp'));

  // instantiate service
  var HighRise;
  beforeEach(inject(function (_HighRise_) {
    HighRise = _HighRise_;
  }));

  it('should do something', function () {
    expect(!!HighRise).toBe(true);
  });

});
