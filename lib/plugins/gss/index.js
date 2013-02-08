var Plugins = require('../plugin.js'),
	googleSpreadsheets = require('../../google/googlespreadsheet.js'),
	_ = require('underscore');


var GSSPlugin = Plugins.sub('GSSPlugin', {

	version: '0.0.1',

	name: __dirname,

	init: function init( options ) {
		console.log('INIT Google Spreadsheet Plugin');

		var credentials = process.env.GOOGLE_LOGIN.split('/');

		this.username = credentials[0],
		this.password = credentials[1];

		this.api = googleSpreadsheets({
			username: this.username,
			password: this.password
		});

	},

	destroy: function destroy() {
		console.log('DESTROYING Google Spreadsheet stuff');
	},

	doJob: function doJob( job ) {

		var self = this;

		var id = job.get('spreadsheet');

		if ( !id ) {
			var noIdError = new Error('Spreadsheet Key not specified');
			noIdError.code = 404;
			job.fail( noIdError );
			return;
		}
		
		var sheetName = job.get('sheet');

		if ( !sheetName ) {
			var noSheetError = new Error('Worksheet Name not specified');
			noSheetError.code = 404;
			job.fail( noSheetError );
			return;
		}

		job.set('type', 'json');
		job.set('cache', job.get('cache'));
		
		var sheetNames = sheetName.split(',');

		this.api.spreadsheet( id ).fetchSheetDataListFeed(sheetNames, function( err, sheets ) {
			if ( err ) {
				job.fail( err );
				return;
			}

			if ( !sheets ) {
				var e = new Error('No Sheet Data Found');
				e.code = 404;
				job.fail( e );
			}

			var body = sheetNames.length == 1 ? sheets[sheetNames[0]] : sheets;
			job.set( 'body', body );
			job.succeed();
		});

	}
});

module.exports = new GSSPlugin();