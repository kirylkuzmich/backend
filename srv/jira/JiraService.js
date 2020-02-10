"use strict";

const axios = require("axios");
const CJiraException = require(global.__base + "jira/JiraException");
const processingRequestWithLimitation = require(global.__base + "jira/JiraLimitationController").processingRequestWithLimitation;

/**
 * @typedef JiraCredentials {Object}
 * @property {string} [sBaseUrl] - Jira System URL
 * @property {AxiosBasicCredentials} [oBasicAuth] - Basic Auth Arguments,
 * there username is username of Jira Account,
 * password is Generated API token
 * @property {string} [sToken] - OAuth 2.0 Generated Token
 * @property {string} [sSystemId] - OAuth 2.0 Jira System ID
 */
/**
 * @typedef JiraRequest {Object}
 * @property {string} sUrl - api endpoint URL
 * @property {string} sMethod - name of HTTP method
 * @property {object} oRequestParams - parameters for request
 * @property {number} nAPIMaxResults - maximum entries in one paginated page
 * @property {number} nStartAt - offset
 * @property {number | null} nUserRequestedMaxResults - quantity of requested record
 * @property {boolean} bSingleEntity default false - REST API endpoint should return single
 * @property {boolean} bTotalExist default false - Does exist total attribute in paginated AxiosResponse
 * @property {string | null} sEntityName - AxiosResponse Entity Name
 * @property {object | null} oData - body of request for POST, PUT, PATCH, etc HTTP methods
 * @property {string} [sLimitParamName="maxResults"]
 * @property {string} [sOffsetParamName="startAt"]
 */

module.exports = class JiraService {
    /**
     * @constructor
     * @param {string} [sBaseUrl] - Jira System URL
     * @param {AxiosBasicCredentials} [oBasicAuth] - Basic Auth Arguments,
     * there username is username of Jira Account,
     * password is Generated API token
     * @param {string} [sToken] - OAuth 2.0 Generated Token
     * @param {string} [sSystemId] - OAuth 2.0 Jira System ID
     * @throws CJiraException
     */
    constructor(sBaseUrl, oBasicAuth, sToken, sSystemId) {
        //Save credentials
        this._jiraCredentials = {
            sBaseUrl: sBaseUrl,
            oBasicAuth: oBasicAuth,
            sToken: sToken,
            sSystemId: sSystemId
        };

        if (sToken && sSystemId) {
            this._jiraInstance = axios.create({
                baseURL: `https://api.atlassian.com/ex/jira/${sSystemId}/`,
                headers: {Accept: "application/json", Authorization: `Bearer ${sToken}`}
            });
        } else if (sBaseUrl && sToken) {
            //Need for Tempo plugin case
            this._jiraInstance = axios.create({
                baseURL: sBaseUrl,
                headers: {Authorization: `Bearer ${sToken}`}
            });
        } else if (sBaseUrl && oBasicAuth) {
            this._jiraInstance = axios.create({
                baseURL: sBaseUrl,
                auth: oBasicAuth,
                headers: {Accept: "application/json"}
            });
        } else {
            throw new CJiraException("Wrong combination of parameters");
        }
    }

    getCredentials() {
        return this._jiraCredentials;
    }

    /**
     * General method to send request to Jira API
     * @param {JiraRequest} oJiraRequest
     * @return {Promise<Promise<AxiosResponse<object>>[]> | Promise<AxiosResponse<object>>}
     * @public
     */
    async sendRequest(oJiraRequest) {

        // Initialization of parameters
        oJiraRequest.oRequestParams = oJiraRequest.oRequestParams || {};
        oJiraRequest.nStartAt = oJiraRequest.nStartAt || 0;
        oJiraRequest.nUserRequestedMaxResults = oJiraRequest.nUserRequestedMaxResults || null;
        oJiraRequest.bSingleEntity = oJiraRequest.bSingleEntity || false;
        oJiraRequest.bTotalExist = oJiraRequest.bTotalExist || false;
        oJiraRequest.sEntityName = oJiraRequest.sEntityName || null;
        oJiraRequest.sLimitParamName = oJiraRequest.sLimitParamName || "maxResults";
        oJiraRequest.sOffsetParamName = oJiraRequest.sOffsetParamName || "startAt";

        oJiraRequest.oRequestParams = JiraService.preparePaginationParams(
            oJiraRequest.sLimitParamName, oJiraRequest.sOffsetParamName,
            oJiraRequest.oRequestParams, oJiraRequest.nStartAt, oJiraRequest.nUserRequestedMaxResults,
            oJiraRequest.nAPIMaxResults, oJiraRequest.bSingleEntity);

        const oRequestConfig = {
            url: oJiraRequest.sUrl,
            method: oJiraRequest.sMethod,
            params: oJiraRequest.oRequestParams,
        };
        if (oJiraRequest.oData && Object.values(oJiraRequest.oData).length) {
            oRequestConfig.data = oJiraRequest.oData;
        }
        const oPromiseResponse = processingRequestWithLimitation(this._jiraInstance, oRequestConfig);

        if (oJiraRequest.bSingleEntity) {
            //User requested only single entry
            return oPromiseResponse;
        } else {
            return this._getAllPaginatedEntries(oPromiseResponse, oJiraRequest);
        }
    }

    /**
     * Get All paginated pages
     * @param {Promise<AxiosResponse>} oPromiseResponse
     * @param {JiraRequest} oJiraRequest
     * @return {Promise<Promise<AxiosResponse<object>>[]>}
     * @protected
     */
    async _getAllPaginatedEntries(oPromiseResponse, oJiraRequest) {

        if (!oJiraRequest.nUserRequestedMaxResults || oJiraRequest.nUserRequestedMaxResults > oJiraRequest.nAPIMaxResults) {
            // User requested more entries, than Jira REST API supported or user doesn't not specify this option
            const oResponseData = (await oPromiseResponse).data;
            const nQuantityEntitiesReturned = oJiraRequest.sEntityName ?
                oResponseData[oJiraRequest.sEntityName].length : oResponseData.length;

            if (!oJiraRequest.bTotalExist && JiraService.isNeedAdditionalRequest(
                oJiraRequest.nUserRequestedMaxResults, oJiraRequest.nAPIMaxResults, nQuantityEntitiesReturned)) {
                // Jira REST API doesn't contain total attribute in AxiosResponse data
                return [].concat(oPromiseResponse, await this._syncResendRequest(oJiraRequest));
            } else if (JiraService.isNeedAdditionalRequest(oJiraRequest.nUserRequestedMaxResults,
                oJiraRequest.nAPIMaxResults, nQuantityEntitiesReturned, oResponseData.total)) {

                return [].concat(oPromiseResponse, this._asyncResendRequest(oJiraRequest, oResponseData.total));
            } else {
                //Additional request doesn't need
                return [oPromiseResponse];
            }
        } else {
            //Additional request doesn't need
            return [oPromiseResponse];
        }
    }

    /**
     * Method to sync read pagination pages
     * @param {JiraRequest} oJiraRequest
     * @return {Promise<Promise<AxiosResponse>[]>}
     * @protected
     */
    async _syncResendRequest(oJiraRequest) {
        let nQuantityAlreadyReadEntries = oJiraRequest.nAPIMaxResults;
        let nQuantityEntitiesFromLastRequest;
        const oNewRequestParams = {};
        const aAllPaginatedResponse = [];

        Object.assign(oNewRequestParams, oJiraRequest.oRequestParams);
        oNewRequestParams[oJiraRequest.sLimitParamName] = oJiraRequest.nAPIMaxResults;

        do {
            //We shouldn't read more entries, then user's requested
            oNewRequestParams[oJiraRequest.sLimitParamName] = oJiraRequest.nUserRequestedMaxResults ?
                Math.min(oJiraRequest.nUserRequestedMaxResults - nQuantityAlreadyReadEntries, oJiraRequest.nAPIMaxResults) :
                oJiraRequest.nAPIMaxResults;
            oNewRequestParams[oJiraRequest.sOffsetParamName] += oJiraRequest.nAPIMaxResults;

            const oNewPaginatedResponse = await processingRequestWithLimitation(this._jiraInstance, {
                url: oJiraRequest.sUrl,
                method: oJiraRequest.sMethod,
                params: oNewRequestParams,
                data: oJiraRequest.oData,
            });

            nQuantityEntitiesFromLastRequest = oJiraRequest.sEntityName ?
                oNewPaginatedResponse.data[oJiraRequest.sEntityName].length :
                oNewPaginatedResponse.length;
            aAllPaginatedResponse.push(Promise.resolve(oNewPaginatedResponse));
            nQuantityAlreadyReadEntries += nQuantityEntitiesFromLastRequest;

        } while (nQuantityEntitiesFromLastRequest === oJiraRequest.nAPIMaxResults &&
        (!oJiraRequest.nUserRequestedMaxResults || (nQuantityAlreadyReadEntries < oJiraRequest.nUserRequestedMaxResults)));

        return aAllPaginatedResponse;
    }

    /**
     *
     * @param {JiraRequest} oJiraRequest
     * @param {number} nTotal
     * @return {Promise<Request>[]}
     * @protected
     */
    _asyncResendRequest(oJiraRequest, nTotal) {

        const nQuantityPaginationPage = Math.ceil((oJiraRequest.nUserRequestedMaxResults || nTotal) / oJiraRequest.nAPIMaxResults);
        const aPromisedResponse = [];
        let nQuantityAlreadyReadEntries = oJiraRequest.nAPIMaxResults;
        //Start with 1, because need to pass first paginated page, that already received
        for (let nIterator = 1; nIterator < nQuantityPaginationPage; nIterator++) {
            const oNewRequestParams = {};
            Object.assign(oNewRequestParams, oJiraRequest.oRequestParams);
            oNewRequestParams[oJiraRequest.sOffsetParamName] = oJiraRequest.nAPIMaxResults * nIterator;

            if (oJiraRequest.nUserRequestedMaxResults) {
                oNewRequestParams[oJiraRequest.sLimitParamName] = Math.min(
                    oJiraRequest.nUserRequestedMaxResults - nQuantityAlreadyReadEntries,
                    oJiraRequest.nAPIMaxResults,
                    nTotal - nQuantityAlreadyReadEntries
                );
            } else {
                oNewRequestParams[oJiraRequest.sLimitParamName] =
                    Math.min(oJiraRequest.nAPIMaxResults, nTotal - nQuantityAlreadyReadEntries);
            }

            aPromisedResponse.push(processingRequestWithLimitation(this._jiraInstance, {
                url: oJiraRequest.sUrl,
                method: oJiraRequest.sMethod,
                params: oNewRequestParams,
                data: oJiraRequest.oData,
            }));
            nQuantityAlreadyReadEntries += oJiraRequest.nAPIMaxResults;
        }
        return aPromisedResponse;
    }

    /**
     * Method to add pagination oRequestParams to request
     * @param {string} sOffsetName
     * @param {string} sLimitParamName
     * @param {object} [oRequestParams={}] - HTTP Request Params like object {paramName: paramValue}
     * @param {number} [nStartAt=0] - offset
     * @param {number | null} nMaxResult - top
     * @param {number} [nDefaultMaxResult=1] - MaxResult for REST API endpoint
     * @param {boolean} [bSingleEntry=false] - Does pagination of API exist
     * @return {object}
     */
    static preparePaginationParams(sLimitParamName, sOffsetName, oRequestParams = {}, nStartAt = 0, nMaxResult = null,
                                   nDefaultMaxResult = 1, bSingleEntry = false) {

        const oParamsWithPaginateOptions = {};
        Object.assign(oParamsWithPaginateOptions, oRequestParams);

        if (!bSingleEntry) {
            oParamsWithPaginateOptions[sOffsetName] = nStartAt;
            // Need send request with minimal possible nMaxResult
            oParamsWithPaginateOptions[sLimitParamName] = Math.min(nMaxResult || nDefaultMaxResult, nDefaultMaxResult);
        }
        return oParamsWithPaginateOptions;
    }

    /**
     * Definition method: whether additional requests are needed to read all the requesting data or not
     * @param {number} [nUserRequestedMaxResults]
     * @param {number} nAPIMaxResults
     * @param {number} nResultLength
     * @param {number | null} nTotal
     * @return {boolean}
     */
    static isNeedAdditionalRequest(nUserRequestedMaxResults, nAPIMaxResults, nResultLength, nTotal = null) {
        if (nUserRequestedMaxResults && nUserRequestedMaxResults > nResultLength) {
            return true;
        } else if (!nUserRequestedMaxResults && nAPIMaxResults === nResultLength) {
            return true;
        } else {
            return (nTotal && Math.min(nUserRequestedMaxResults || nAPIMaxResults, nAPIMaxResults) > nResultLength &&
                nTotal > nResultLength);
        }
    }
}
;
