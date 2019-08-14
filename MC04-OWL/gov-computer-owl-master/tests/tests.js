'use strict';

var ghFunctions = require('../controllers/ghFunctions');
const chai = require('chai');
chai.should();

describe('GitHub functions', function() {
  describe('Retrieving measure', function() {
    it('Implicit measure should be retrieved', function() {
      return ghFunctions.getMeasure(`{
        "element": "number"
      }`).then(res => {
        res.should.be.eql({
          element: "number"
        });
      });
    });

    it('External measure should be retrieved', function() {
      return ghFunctions.getMeasure('https://raw.githubusercontent.com/raffrearaUS/gov-computer-owl/master/tests/testmeasure.json?token=AIAATMB26RZHIZYYGOX373C467PV2').then(res => {
        res.should.be.eql({
          element: "number"
        });
      });
    });
  });

  describe('Project scope', function() {
    this.timeout(10000);
    it('All isues should be retrieved', function() {
      var filters = {
        type: "feature,chore,bug"
      };
      var periodInfo = {
        initial: '2019-01-01T12:00:00.000Z',
        end: '2019-01-31T12:00:00.000Z',
        timezone: 'Europe/Madrid'
      }
      return ghFunctions.getProject(filters, "number", "raffrearaUS", "gov-computer-owl", "Planning", periodInfo, 0).then(res => {
        res.should.be.an('object');
        res.should.have.property('scope');
        res.should.have.property('period');
        res.period.from.should.be.equal(periodInfo.initial);
        res.period.to.should.be.equal(periodInfo.end);
        res.evidences.length.should.be.equal(4);
        res.value.should.be.equal(4);
      });
    });

    it('No issue should be retrieved using old offset', function() {
      var filters = {
        type: "feature,chore,bug"
      };
      var periodInfo = {
        initial: '2019-01-01T12:00:00.000Z',
        end: '2019-01-31T12:00:00.000Z',
        timezone: 'Europe/Madrid'
      }
      return ghFunctions.getProject(filters, "number", "raffrearaUS", "gov-computer-owl", "Planning", periodInfo, -1).then(res => {
        res.should.be.an('object');
        res.should.have.property('scope');
        res.should.have.property('period');
        res.period.from.should.be.equal(periodInfo.initial);
        res.period.to.should.be.equal(periodInfo.end);
        res.evidences.length.should.be.equal(0);
        res.value.should.be.equal(0);
      });
    });

    it('Only planned features with 2 points should be retrieved', function() {
      var filters = {
        type: "feature",
        estimate: 2,
        state: "to_do"
      };
      var periodInfo = {
        initial: '2019-01-01T12:00:00.000Z',
        end: '2019-01-31T12:00:00.000Z',
        timezone: 'Europe/Madrid'
      }
      return ghFunctions.getProject(filters, "number", "raffrearaUS", "gov-computer-owl", "Planning", periodInfo, 0).then(res => {
        res.should.be.an('object');
        res.should.have.property('scope');
        res.should.have.property('period');
        res.period.from.should.be.equal(periodInfo.initial);
        res.period.to.should.be.equal(periodInfo.end);
        res.evidences.length.should.be.equal(1);
        res.value.should.be.equal(1);
      });
    });

    it('The total number of points should be retrieved', function() {
      var filters = {
        type: "feature,bug,chore"
      };
      var periodInfo = {
        initial: '2019-01-01T12:00:00.000Z',
        end: '2019-01-31T12:00:00.000Z',
        timezone: 'Europe/Madrid'
      }
      return ghFunctions.getProject(filters, "points", "raffrearaUS", "gov-computer-owl", "Planning", periodInfo, 0).then(res => {
        res.should.be.an('object');
        res.should.have.property('scope');
        res.should.have.property('period');
        res.period.from.should.be.equal(periodInfo.initial);
        res.period.to.should.be.equal(periodInfo.end);
        res.evidences.length.should.be.equal(4);
        res.value.should.be.equal(5);
      });
    });

    it('The stories themselves should be retrieved', function() {
      var filters = {
        type: "feature,bug,chore"
      };
      var periodInfo = {
        initial: '2019-01-01T12:00:00.000Z',
        end: '2019-01-31T12:00:00.000Z',
        timezone: 'Europe/Madrid'
      }
      return ghFunctions.getProject(filters, "issues", "raffrearaUS", "gov-computer-owl", "Planning", periodInfo, 0).then(res => {
        res.should.be.an('object');
        res.should.have.property('scope');
        res.should.have.property('period');
        res.period.from.should.be.equal(periodInfo.initial);
        res.period.to.should.be.equal(periodInfo.end);
        res.evidences.length.should.be.equal(4);
        res.value.should.be.an('array');
        res.value.length.should.be.equal(4);
      });
    });
  });

  describe('Member scope', function() {
    this.timeout(10000);
    it('All isues should be retrieved', function() {
      var filters = {
        type: "feature,chore,bug"
      };
      var periodInfo = {
        initial: '2019-01-01T12:00:00.000Z',
        end: '2019-01-31T12:00:00.000Z',
        timezone: 'Europe/Madrid'
      }
      return ghFunctions.getAllMembers(filters, "number", "raffrearaUS", "gov-computer-owl", "Planning", periodInfo, 0).then(res => {
        res.should.be.an('array');
        var member = res.find(members => members.scope.member === 'raffrearaUS');
        member.should.have.property('scope');
        member.should.have.property('period');
        member.period.from.should.be.equal(periodInfo.initial);
        member.period.to.should.be.equal(periodInfo.end);
        member.evidences.length.should.be.equal(4);
        member.value.should.be.equal(4);
      });
    });
  });
});