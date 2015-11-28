JSON_RPC = {

	/**
	* @example
	* Request
	* JSON_RPC.call("jsonrpcserver.php", "add", [1,2])
        * JSON_RPC.responce.success = function(response){
        *   if ( response.result ) alert(response.result)
        * }
	* @example
	* Notification
	* JSON_RPC.call("jsonrpcserver.php", "save", { "message", "Hello!" }, true)
	*/
	
	
	/**
	* Calls remote procedure
	* @param {string} url An URL of JSON-RPC server
	* @param {string} method A name of a procedure to be invoked.
	* @param {(array|object)} [params]
	* @param {boolean} [isNotification] If set to true, the method will send a notification
	*/
	call: function(url, method, params, isNotification){
		// JSON-RPC string
		var request
		
		if ( url === undefined )
			throw new Error('Parameter "url" is required')
		
		// Notification?
                if ( isNotification === true )
			request = this.createNotification(method, params)
		else
			request = this.createRequest(method, params)
		
		
		$.ajax(url, {
			method: 'POST',
			contentType: 'application/json',
			data: request,
			success: function(response, textStatus, jqXHR){
                            if ( response.error )
                                throw new JSON_RPC_Error(response.error, response.code)

                            if ( typeof JSON_RPC.response.success === "function" )
                                JSON_RPC.response.success(response.result, response, textStatus, jqXHR)
			},
			error: function(jqXHR, textStatus, errorThrown){
				if ( typeof JSON_RPC.response.error === "function" )
					JSON_RPC.response.error(jqXHR, textStatus, errorThrown)
			},
			dataType: 'json'
		})
	},
	
	/**
	* Creates a JSON-RPC request
	* @param {string} method A name of a procedure to be invoked.
	* @param {(array|object)} [params]
	* @return {string} A JSON-RPC Request
	*/
	createRequest: function(method, params){
		var result
		
		this.checkParams(method, params)
		
		Object.defineProperty(this.request, "id", { enumerable: true })
		result = JSON.stringify(this.request)
		
		this.request.method = null
		this.request.params = null
		this.id++
		
		return result
	},
	
	/**
	* Creates a notification
	* @param {string} method A name of a procedure to be invoked.
	* @param {(array|object)} [params]
	* @return {string} A notification
	*/
	createNotification: function(method, params){
		var result
		
		this.checkParams(method, params)
		
                // hides the id property
		Object.defineProperty(this.request, "id", { enumerable: false })
		result = JSON.stringify(this.request)
		
		this.request.method = null
		this.request.params = null
		
		return result
	},
	
	/**
	* Checks parameters passed to methods above
	* @param {string} method A name of a procedure to be invoked.
	* @param {(array|object)} [params]
	* @return {void}
	*/
	checkParams: function(method, params){
	
		// Checks method
		if ( method !== undefined ) {
			this.request.method = method
		} else {
			if ( this.request.method === null )
				throw new Error('Parameter "method" is required')
		}
		
		// Checks params
		if ( params !== undefined ) {
			Object.defineProperty(this.request, "params", { enumerable: true })
			this.request.params = params
		} else {
			if ( this.request.params === null )
				Object.defineProperty(this.request, "params", { enumerable: false })
		}
		
	},
        
        request: {
            jsonrpc: "2.0",
            method: null,
            params: null,
            id: 0
        },
	response: {
            success: null,
            error: null
        }
        
}

/**
 * @class 
 * @param {string} message A text of an error
 * @param {(string|number)} code A code of an error
 */
function JSON_RPC_Error(message, code){
    this.message = message
    this.code = code
}
