import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | navi-search-provider', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let service = this.owner.lookup('service:navi-search-provider');
    assert.ok(service);
  });

  test('get all search providers', function(assert) {
    let service = this.owner.lookup('service:navi-search-provider');
    let availableSearchProviders = service.all();
    assert.equal(availableSearchProviders.length, 1, 'Discovered 1 search provider.');
  });
});
