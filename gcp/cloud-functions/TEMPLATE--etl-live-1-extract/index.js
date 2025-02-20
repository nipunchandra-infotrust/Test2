require('dotenv').config();
const fs = require('fs');
const os = require('os');

// External Platfom SDKs

// GCP SDKs
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

// Helper Modules
const gcp = require('./modules/gcp')
const mw = require('./modules/middleware')

// GLOBAL VARS
const gcpProjectId = 'infotrust-internal-integration';
const gcpBucketName = 'TEMPLATE';

/**
 * TEMPLATE--etl-live-1-extract
 * 
 * EXTRACT
 * Extract SOQL data from quickbooks and store in gcp bucket
 * 
 */

exports.extract = async (event, context, callback) => { 
    // handle envs
    let local = process.argv.includes('--local');
    let dev = process.argv.includes('--dev');
    let attributes = local ? event.body.attributes : event.attributes; // if local then change object structure
    console.log('attributes', attributes);

    const secretsClient = await new SecretManagerServiceClient(); // connect to gcpSecrets

    // secrets
    if(dev) {
        // set auth secrets from .env file
    } else {
        // get secrets from GCP
    }

    // file system
    if(local){
        rootFilePath = './tmp'
    } else {
        rootFilePath = os.tmpdir();
    }

    // PLATFORM AUTH
    /// Connect OAuth
    /// Refresh Tokens
    /// Update GCP Secrets

    if(attributes.extractType == 'EXTRACTSAMPLE') {
        // prep the file
        let localFilePath = `${rootFilePath}/profitAndLossByClass.csv`
        fs.writeFile(localFilePath, 'header1,header2,header3', err => {});

        // await get exctration as JSON from platform modules platform.js

        // transform JSON result to csv rows

        // loop rows and write to local file

        // upload to GCP bucket
    }

}