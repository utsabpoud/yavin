import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

let Store, MetadataService, controller, compression;

module('Unit | Controller | dashboards/dashboard/view', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:navi-metadata');

    controller = this.owner.lookup('controller:dashboards/dashboard/view');
    compression = this.owner.lookup('service:compression');

    return MetadataService.loadMetadata();
  });

  test('updateFilter', async function(assert) {
    assert.expect(3);

    let osFilter = Store.createFragment('bard-request-v2/fragments/filter', {
        type: 'dimension',
        field: 'os',
        parameters: {
          field: 'id'
        },
        operator: 'in',
        values: ['MacOS'],
        source: 'bardOne'
      }),
      author = await Store.findRecord('user', 'navi_user'),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });

    dashboard.get('filters').pushObject(osFilter);
    await dashboard.save();

    assert.equal(dashboard.get('filters.length'), 1, 'Dashboard has one filter');

    controller.transitionToRoute = async (destination, transition) => {
      assert.deepEqual(
        transition,
        {
          queryParams: {
            filters:
              'EQbwOsBmCWA2AuBTATgZwgLgNrmAewAcUBDePZTCaAOwgBoIA3Y2AV0XWGwgFliBjAPIBlehADqNACZ4A7pwC6DKNESwplfJ2UFiyYgFtESNJlww1GrlSsBfZfACeRTVOhHqqaHlrBlqPFZkfkRNACM9KUFqUOBbBVtgIAAA'
          }
        },
        'Updating the filter sets the filters query param to the expected compressed string'
      );

      const decompressed = await compression.decompress(transition.queryParams.filters);
      assert.deepEqual(
        decompressed,
        {
          filters: [
            {
              type: 'dimension',
              field: 'os',
              parameters: {
                field: 'id'
              },
              operator: 'in',
              values: ['MacOS', 'Windows'],
              source: 'bardOne'
            }
          ]
        },
        'The filter decompresses correctly'
      );
    };

    await controller.send('updateFilter', dashboard, osFilter, { values: ['MacOS', 'Windows'] });
  });

  test('removeFilter', async function(assert) {
    assert.expect(3);
    let osFilter = Store.createFragment('bard-request-v2/fragments/filter', {
        type: 'dimension',
        field: 'os',
        parameters: {
          field: 'id'
        },
        operator: 'in',
        values: ['MacOS'],
        source: 'bardOne'
      }),
      author = await Store.findRecord('user', 'navi_user'),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });

    dashboard.get('filters').pushObject(osFilter);
    await dashboard.save();

    assert.equal(dashboard.get('filters.length'), 1, 'Dashboard has one filter');

    controller.transitionToRoute = async (destination, transition) => {
      assert.deepEqual(
        transition,
        {
          queryParams: {
            filters: 'EQbwOsBmCWA2AuBTATgZwgLgNoF0C-wQAAA'
          }
        },
        'Removing the filter sets the filters query param to the expected compressed string'
      );

      const decompressed = await compression.decompress(transition.queryParams.filters);
      assert.deepEqual(decompressed, { filters: [] }, 'The filter decompresses correctly to an empty array');
    };

    await controller.send('removeFilter', dashboard, osFilter);
  });

  test('addFilter', async function(assert) {
    assert.expect(2);
    let author = await Store.findRecord('user', 'navi_user'),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });

    controller.transitionToRoute = async (destination, transition) => {
      assert.deepEqual(
        transition,
        {
          queryParams: {
            filters:
              'EQbwOsBmCWA2AuBTATgZwgLgNrmAewAcUBDePZTCaAOwgBoIA3Y2AV0XWGwF0GppEsACaVgxAOaJ6EAsWTEAtoiRpMuGIJFcqWgL594ATyKih0JdVTQ8tYH1R5WyAMZTtwAEZyhAeWpvdbl1gIA'
          }
        },
        'Adding a filter sets the filters query param to the expected compressed string'
      );

      const decompressed = await compression.decompress(transition.queryParams.filters);
      assert.deepEqual(
        decompressed,
        {
          filters: [
            {
              type: 'dimension',
              field: 'age',
              parameters: {
                field: 'id'
              },
              operator: 'in',
              values: [],
              source: 'bardOne'
            }
          ]
        },
        'The filter decompresses correctly to an array with a valueless filter'
      );
    };

    await controller.send('addFilter', dashboard, { type: 'dimension', field: 'age', dataSource: 'bardOne' });
  });

  test('Add filter from other datasource', async function(assert) {
    assert.expect(2);
    await MetadataService.loadMetadata({ dataSourceName: 'bardTwo' });
    let author = await Store.findRecord('user', 'navi_user'),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });

    controller.transitionToRoute = async (destination, transition) => {
      assert.deepEqual(
        transition,
        {
          queryParams: {
            filters:
              'EQbwOsBmCWA2AuBTATgZwgLgNrmAewAcUBDePZTCaAOwgBoIA3Y2AV0XWGwF0GppEsACaVgAYzzV4xGinoQCxZMQC2iJGky4YgkVyp6Avn3gBPIqKHQ11VNEnzgqPK2RjEogEZKhAFQDueBCG3IbAQAA'
          }
        },
        'Adding a filter sets the filters query param to the expected compressed string'
      );

      const decompressed = await compression.decompress(transition.queryParams.filters);
      assert.deepEqual(
        decompressed,
        {
          filters: [
            {
              type: 'dimension',
              field: 'container',
              parameters: {
                field: 'id'
              },
              operator: 'in',
              values: [],
              source: 'bardTwo'
            }
          ]
        },
        'The filter decompresses correctly to an array with a valueless filter'
      );
    };

    await controller.send('addFilter', dashboard, { type: 'dimension', field: 'container', dataSource: 'bardTwo' });
  });

  test('Updating multidatasource filter', async function(assert) {
    assert.expect(2);
    await MetadataService.loadMetadata({ dataSourceName: 'bardTwo' });
    const containerFilter = Store.createFragment('bard-request-v2/fragments/filter', {
      type: 'dimension',
      field: 'container',
      parameters: {
        field: 'id'
      },
      operator: 'in',
      values: [],
      source: 'bardTwo'
    });
    let author = await Store.findRecord('user', 'navi_user'),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });

    dashboard.filters.pushObject(containerFilter);

    controller.transitionToRoute = async (destination, transition) => {
      assert.deepEqual(
        transition,
        {
          queryParams: {
            filters:
              'EQbwOsBmCWA2AuBTATgZwgLgNrmAewAcUBDePZTCaAOwgBoIA3Y2AV0XWGwgEYIBdBlGiJYAE0rAAxnmrxiNFPQgFiyYgFtESNJlwxRErlSMBfIfACeRSWOhbqqaLOXBUeVsimJJAIzViACoA7ngQpvymwEAAA'
          }
        },
        'Adding a filter sets the filters query param to the expected compressed string'
      );

      const decompressed = await compression.decompress(transition.queryParams.filters);
      assert.deepEqual(
        decompressed,
        {
          filters: [
            {
              type: 'dimension',
              field: 'container',
              parameters: {
                field: 'id'
              },
              operator: 'in',
              values: ['1'],
              source: 'bardTwo'
            }
          ]
        },
        'The filter decompresses correctly to an array with updated values'
      );
    };

    await controller.send('updateFilter', dashboard, containerFilter, { values: ['1'] });
  });
});
