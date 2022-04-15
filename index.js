/**
 * The following script provides a NodeJS wrapper for the administration and
 * configuration APIs of webMethods API Gateway to find API project details
 * via a GitHub Actions workflow step. 
 */

const core = require('@actions/core');
const axios = require('axios');

/**
 * Find an API project with specified name and version in a collection of 
 * API objects. 
 *  
 * @param {*} allApis       Collection of API objects returned by the gateway
 * @param {*} api_name      The name of the API project
 * @param {*} api_version   The version of the API project
 * @returns                 The wanted API object or null
 */
function findApi(allApis, api_name, api_version) {
    let api = null;

    try {
        allApis.apiResponse.forEach(item => {
            if (api_name == item.api.apiName && api_version == item.api.apiVersion) {
                api = item.api;
                // throwing an error to break the forEach loop
                throw 'Found';
            }
        });
    }
    catch(e) {
        // ignore the error we threw to break the forEach loop
        if (e != 'Found') throw e;
    }

    return api;
}

/**
 * Gets all registered API objects from a wM API Gateway instance.
 * 
 * @param {*} apigw_url         Base URL of the wM API Gateway instance
 * @param {*} apigw_user        Username for authentication with the gateway
 * @param {*} apigw_password    Password for authentication with the gateway
 * @returns                     A collection of API objects
 */
async function getAllApis(apigw_url, apigw_user, apigw_password) {
    let response;    
    try {
        response = await axios.get(`${apigw_url}/rest/apigateway/apis`, {
            headers: { 'Accept': 'application/json'},
            auth: {
                username: apigw_user,
                password: apigw_password
            }
        });

        return response.data;
    }
    catch(error) {
        console.log(error);
        throw 'Failed to query API Gateway';
    }
}

/**
 * Main logic for the GitHub Action step which parses inputs, invokes the 
 * proper function and sets outputs.
 */
async function run() {
    try {
        // Get the API Gateway instance parameters
        const apigw_url = core.getInput('apigw-url');
        const apigw_user = core.getInput('apigw-user');
        const apigw_password = core.getInput('apigw-password');
        
        // Get the API lookup parameters
        const api_name = core.getInput('api-name');
        const api_version = core.getInput('api-version');
        const fail_if_not_found = (core.getInput('fail-if-not-found').toLowerCase() == 'true');
    
        let allApis = await getAllApis(apigw_url, apigw_user, apigw_password);
        
        let api = findApi(allApis, api_name, api_version);
        if (api != null) {
            // Set the outputs according to the found API object
            core.setOutput('api-id', api.id);
            core.setOutput('api-name', api.apiName);
            core.setOutput('api-version', api.apiVersion);
            core.setOutput('api-type', api.type);
            core.setOutput('api-is-active', api.isActive);
        }
        else 
            if(fail_if_not_found)
                core.setFailed('API project ' + api_name + ' with version ' + api_version + ' not found!');
            else {
                // Set empty action output parameters if the action shouldn't fail
                core.setOutput('api-id', '');
                core.setOutput('api-name', '')
                core.setOutput('api-version', '');
                core.setOutput('api-type', '');
                core.setOutput('api-is-active', false);
            }
    }
    catch(error) {
        core.setFailed(error.message);
    }
}

// export the functions for unit testing
module.exports = { 
    getAllApis,
    findApi,
    run
};

if (require.main === module) {
    run();
}