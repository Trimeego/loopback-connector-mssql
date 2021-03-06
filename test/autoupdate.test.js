require('./init.js');
var assert = require('assert');
var ds;

before(function () {
  ds = getDataSource();
});

describe('MS SQL server connector', function () {
  it('should auto migrate/update tables', function (done) {

    var schema_v1 =
    {
      "name": "CustomerTest",
      "options": {
        "idInjection": false,
        "mssql": {
          "schema": "dbo",
          "table": "CUSTOMER_TEST"
        }
      },
      "properties": {
        "id": {
          "type": "String",
          "length": 20,
          "id": 1
        },
        "name": {
          "type": "String",
          "required": false,
          "length": 40
        },
        "email": {
          "type": "String",
          "required": false,
          "length": 40
        },
        "age": {
          "type": "Number",
          "required": false
        }
      }
    }

    var schema_v2 =
    {
      "name": "CustomerTest",
      "options": {
        "idInjection": false,
        "mssql": {
          "schema": "dbo",
          "table": "CUSTOMER_TEST"
        }
      },
      "properties": {
        "id": {
          "type": "String",
          "length": 20,
          "id": 1
        },
        "email": {
          "type": "String",
          "required": false,
          "length": 60,
          "mssql": {
            "columnName": "EMAIL",
            "dataType": "nvarchar",
            "dataLength": 60,
            "nullable": "Y"
          }
        },
        "firstName": {
          "type": "String",
          "required": false,
          "length": 40
        },
        "lastName": {
          "type": "String",
          "required": false,
          "length": 40
        }
      }
    }

    ds.createModel(schema_v1.name, schema_v1.properties, schema_v1.options);

    ds.automigrate(function (err) {
      assert(!err);
      ds.discoverModelProperties('CUSTOMER_TEST', function (err, props) {
        assert(!err);
        assert.equal(props.length, 4);
        var names = props.map(function (p) {
          return p.columnName;
        });
        assert.equal(names[0], 'id');
        assert.equal(names[1], 'name');
        assert.equal(names[2], 'email');
        assert.equal(names[3], 'age');

        ds.createModel(schema_v2.name, schema_v2.properties, schema_v2.options);

        ds.autoupdate(function (err, result) {
          ds.discoverModelProperties('CUSTOMER_TEST', function (err, props) {
            assert.equal(props.length, 4);
            var names = props.map(function (p) {
              return p.columnName;
            });
            assert.equal(names[0], 'id');
            assert.equal(names[1], 'email');
            assert.equal(names[2], 'firstName');
            assert.equal(names[3], 'lastName');
            // console.log(err, result);
            done(err, result);
          });
        });
      });
    });
  });
});

