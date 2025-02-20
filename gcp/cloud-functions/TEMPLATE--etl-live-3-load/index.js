// Import the Google Cloud client libraries
const {BigQuery} = require('@google-cloud/bigquery');
const {Storage} = require('@google-cloud/storage');

// helper modules
const gcp = require('./modules/gcp')

// GLOBAL VARS
const gcpProjectId = 'infotrust-internal-integration';
const gcpSyncDatasetName = 'logs';
const gcpSyncTableName = 'sync_history';

/**
 * Triggered from a change to a Cloud Storage bucket.
 * 
 * LOAD
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.load = async (event, context) => {
  const gcsEvent = event;
  console.log(`Processing file: ${gcsEvent.name}`);

  // init clients
  const bigquery = new BigQuery();
  const storage = new Storage();

  // filed props
  const filename = event.name;
  const bucketName = event.bucket; 

  // temp vars
  const datasetName = 'TEMPLATE_live';
  const tableName = filename.substring(0, filename.indexOf('/')); // dynamic from listening foldername

  // get the new file
  const csvFile = await storage.bucket(bucketName).file(filename);

  console.log(csvFile.toString());

  // prep the BQ load
  let metadata = {
    sourceFormat: 'CSV',
    //skipLeadingRows: 1,
    autodetect: true,
    location: 'US',
    writeDisposition: 'WRITE_TRUNCATE',
    allowQuotedNewlines: true
  };

  // send to BQ
  try{   
    const [job] = await bigquery
      .dataset(datasetName)
      .table(tableName)
      .load(csvFile, metadata)
    // load() waits for the job to finish
    console.log(`Job ${job.id} completed for ${tableName} table`);
    // update sync_history table
    gcp.syncHistory.createLog(gcpProjectId, gcpSyncDatasetName, gcpSyncTableName, 'TEMPLATE', tableName, 'extract', 'success')
  } catch(err) {
    console.log('could not send. error: ' + err);
    gcp.syncHistory.createLog(gcpProjectId, gcpSyncDatasetName, gcpSyncTableName, 'TEMPLATE', tableName, 'extract', 'failed')
  }
};