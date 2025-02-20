const {BigQuery} = require('@google-cloud/bigquery');

// SYNC-STATUS
createLog = async (projectId, datasetName, tableName, platform, exportDetail, processType, syncResult) => {
    // connect to bq
    const bigquery = new BigQuery();

    // timestamp
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth()+1 < 10 ? '0' + (now.getMonth()+1) : now.getMonth()+1;
    let date = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    let seconds = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
    let timestamp = `${year}-${month}-${date} ${hours}:${minutes}:${seconds} UTC`;
    
    // run insert query
    const insertQuery = `INSERT \`${projectId}.${datasetName}.${tableName}\` (timestamp, platform, exportDetail, processType, result) VALUES('${timestamp}', '${platform}', '${exportDetail}', '${processType}', '${syncResult}')`;
    // RUN QUERY
    const options = { query: insertQuery, location: 'US' }
    const result = await bigquery.query(options);
    console.log(result);
}

exports.syncHistory = {
    createLog: createLog
}