const {Storage} = require('@google-cloud/storage');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

// GCP Storage Bucket
streamToBucket = async (bucketName, folderName, localFilePath) => {
    console.log('starting stream to bucket')
    // find the localFilePath
    console.table({
        'bucketName': bucketName,
        'folderName': folderName,
        'localFilePath': localFilePath
    })

    // calc file name by date
    const today = new Date();
    const writeFileName = `${today.getMonth()+1}-${today.getDate()}-${today.getFullYear()}_${today.getHours()}-${today.getMinutes()}`;

    // connect to gcp storage
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const destFileName = `${folderName}/${writeFileName}.csv`;
    //const newFile = bucket.file(destFileName);

    // pipe the data
    await bucket.upload(localFilePath, {destination: destFileName})
    console.log("upload to gcp complete"); 
    return true;
}

// GCP Secret Manager
getLatestSecretVersionValue = async ( secretsClient, projectId, secretName ) => {
    const secretParentName = `projects/${projectId}/secrets/${secretName}`

    // list secret versions
    const [versions] = await secretsClient.listSecretVersions({ parent: secretParentName });
    // get latest version
    let latestVersion = versions.reduce((prev, current) => {
        return prev.createTime.seconds > current.createTime.seconds ? prev : current;
    })

    // get latest version value 
    const [latestVersionDetails] = await secretsClient.accessSecretVersion({ name: latestVersion.name })
    let latestVersionValue = latestVersionDetails.payload.data.toString();

    return latestVersionValue;
}

conditionalSecretUpdate = async ( secretsClient, projectId, secretName, newValue ) => {

    //const secretsClient = await new SecretManagerServiceClient();
    const secretParentName = `projects/${projectId}/secrets/${secretName}`

    // list secret versions
    const [versions] = await secretsClient.listSecretVersions({ parent: secretParentName });

    // get current version, soon to be previous
    let newestVersion = versions.reduce((prev, current) => {
        return prev.createTime.seconds > current.createTime.seconds ? prev : current;
    })

    // conditionally set new version with new value
    /// get current value
    const [currentVersion] = await secretsClient.accessSecretVersion({ name: newestVersion.name });
    const currentValue = currentVersion.payload.data.toString();

    if(currentValue == newValue) { 
        // do nothing
        console.log(`gcp secret already has latest refresh token ${currentVersion.name}`);
        return currentVersion;
    } else {
        // continue
        // create new secret version
        const payload = Buffer.from(newValue, 'utf8');
        const [newVersion] = await secretsClient.addSecretVersion({
            parent: secretParentName,
            payload: {
            data: payload,
            },
        });

        // destroy now previous version
        const [previousVersion] = await secretsClient.destroySecretVersion({
            name: currentVersion.name,
        });
        console.log(`new version set ${newVersion.name}`)
        return newVersion;
    }
}

// EXPORTS
exports.secrets = {
    getLatestSecretVersionValue: getLatestSecretVersionValue,
    conditionalSecretUpdate: conditionalSecretUpdate
}

exports.bucket = {
    streamToBucket: streamToBucket
}