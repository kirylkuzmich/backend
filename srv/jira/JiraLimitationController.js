/**
 * Jira REST API has limit for quantity of parallel requests at the same time
 * and we should controlling quantity parallel requests
 */

/**
 * Shared memory array with one unsigned byte values
 * @type {Uint8Array}
 * @private
 */
const __nQuantityRequest = new Uint8Array(new SharedArrayBuffer(1));
/**
 * Container of active requests
 * @type {Set<Promise<any>>}
 * @private
 */
const __oInProcessingPromises = new Set();
/**
 * Max possible parallel request
 * @type {number}
 */
const MAX_PARALLEL_REQUEST = 25;

/**
 * Class for controlling limit of parallel request
 */
class JiraLimitationController {
    /**
     * This method provide functionality for limitation send request
     * @param {AxiosInstance} oAxiosInstance
     * @param {AxiosRequestConfig} oRequestConfig
     * @return {Promise<AxiosResponse>}
     */
    static async processingRequestWithLimitation(oAxiosInstance, oRequestConfig) {
        let oRequestPromise;
        while (true) {
            if (JiraLimitationController._inc()) {
                oRequestPromise = oAxiosInstance.request(oRequestConfig);
                __oInProcessingPromises.add(oRequestPromise);
                break;
            } else if (__oInProcessingPromises.size) {
                await Promise.race(__oInProcessingPromises);
            }
        }

        const oAxiosResponse = await oRequestPromise;
        __oInProcessingPromises.delete(oRequestPromise);
        JiraLimitationController._dec();
        return oAxiosResponse;
    }

    /**
     * Increment counter
     * @return {boolean} - if true - operation successfully done
     * @private
     */
    static _inc() {
        if (Atomics.load(__nQuantityRequest, 0) < MAX_PARALLEL_REQUEST) {
            Atomics.add(__nQuantityRequest, 0, 1);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Decrement counter
     * @return {boolean} - if true - operation successfully done
     * @private
     */
    static _dec() {
        if (Atomics.load(__nQuantityRequest, 0)) {
            Atomics.sub(__nQuantityRequest, 0, 1);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Value of counter
     * @return {Number}
     * @private
     */
    static _value() {
        return Atomics.load(__nQuantityRequest, 0);
    }
}

module.exports = JiraLimitationController;
