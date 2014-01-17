/*
*Copyright © 2013 Yahoo! Inc. All rights reserved.
*Redistribution and use of this software in source and binary forms, with or without
*modification, are permitted provided that the following conditions are met:
*Redistributions of source code must retain the above copyright notice, this list
*of conditions and the following disclaimer.
*Redistributions in binary form must reproduce the above copyright notice, this list
*of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
*Neither the name of Yahoo! Inc. nor the names of YUI's contributors may be used to
*endorse or promote products derived from this software without specific prior written permission of Yahoo! Inc.
*
*THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
*EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
*OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
*SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
*SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
*OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
*HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
*OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
*EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
*Sources of Intellectual Property Included in the YUI Library
*YUI is issued by Yahoo! under the BSD license above.
*Below is a list of certain publicly available software that is the source of
*intellectual property in YUI, along with the licensing terms that pertain to
*those sources of IP. This list is for informational purposes only and is not
*intended to represent an exhaustive list of third party contributions to YUI.
*
*Douglas Crockford's JSON parsing and stringifying methods: In the JSON Utility,
*Douglas Crockford's JSON parsing and stringifying methods are adapted from work
*published at JSON.org. The adapted work is in the public domain.
*Robert Penner's animation-easing algorithms: In the Animation Utility, YUI
*makes use of Robert Penner's algorithms for easing.
*Geoff Stearns's SWFObject: In the Charts Control and the Uploader versions
*through 2.7.0, YUI makes use of Geoff Stearns's SWFObject v1.5 for Flash Player
*detection and embedding. More information on SWFObject can be found at
*http://blog.deconcept.com/swfobject/. SWFObject is (c) 2007 Geoff Stearns and
*is released under the MIT License (http://www.opensource.org/licenses/mit-license.php).
*Diego Perini's IEContentLoaded technique: The Event Utility employs a technique
*developed by Diego Perini and licensed under GPL. YUI's use of this technique is
*included under our BSD license with the author's permission.
*Yehuda Katz's Handlebars.js: YUI includes a wrapped version of Handlebars in our
*distribution. Handlebars.js is licensed under the MIT license which is in
*compliance with YUI's BSD license.
*/

/*
 * Written by Nicholas C. Zakas, nczonline.net
 * Modified for the GPS course format by Barry Oosthuizen, elearningstudio.co.uk
 */

/**
 * Geolocation API
 * @module gallery-geo
 */

/*(intentionally not documented)
 * Tries to get the current position by using the native geolocation API.
 * If the user denies permission, then no further attempt is made to get
 * the location. If an error occurs, then an attempt is made to get the
 * location information by IP address.
 * @param callback {Function} The callback function to call when the
 *      request is complete. The object passed into the request has
 *      four properties: success (true/false), coords (an object),
 *      timestamp, and source ("native" or "geoplugin").
 * @param scope {Object} (Optional) The this value for the callback function.
 * @param opts {Object} (Optional) The PositionOptions object passed to
 *      the getCurrentPosition function and has three optional properties:
 *      enableHighAccuracy (true/false), timeout (number), maximumAge (number).
 */

YUI.add('moodle-format_gps-geo', function(Y) {

    var GEONAME = 'gps_geo';
    var GEO = function() {
        GEO.superclass.constructor.apply(this, arguments);
    };
    Y.extend(GEO, Y.Base, {

        initializer : function () {

            /**
             * Geolocation API
             * @class Geo
             * @static
             */
            Y.Geo = {

                /**
                 * Get the current position. This tries to use the native geolocation
                 * API if available. Otherwise it uses the GeoPlugin site to do an
                 * IP address lookup.
                 * @param callback {Function} The callback function to call when the
                 *      request is complete. The object passed into the request has
                 *      four properties: success (true/false), coords (an object),
                 *      timestamp, and source ("native" or "geoplugin").
                 * @param scope {Object} (Optional) The this value for the callback function.
                 */
                getCurrentPosition: navigator.geolocation ?
                getCurrentPositionByAPI :
                getCurrentPositionByGeoIP

            };

            Y.Geo.getCurrentPosition(function(response){

                //check to see if it was successful
                if (response.success){
                    console.log(response.coords.latitude);
                    console.log(response.coords.longitude);
                    var params = {
                        sesskey : M.cfg.sesskey,
                        longitude : response.coords.longitude,
                        latitude : response.coords.latitude
                    };
                    Y.io(M.cfg.wwwroot+'/course/format/gps/geo.php', {
                        method: 'POST',
                        data: build_querystring(params),
                        context: this

                    });
                } else {
                    console.log(response.code);
                }

            });

            /**
            * Geolocation API
            * @module gallery-geo
            */

            /*(intentionally not documented)
            * Tries to get the current position by using the native geolocation API.
            * If the user denies permission, then no further attempt is made to get
            * the location. If an error occurs, then an attempt is made to get the
            * location information by IP address.
            * @param callback {Function} The callback function to call when the
            *      request is complete. The object passed into the request has
            *      four properties: success (true/false), coords (an object),
            *      timestamp, and source ("native" or "geoplugin").
            * @param scope {Object} (Optional) The this value for the callback function.
            * @param opts {Object} (Optional) The PositionOptions object passed to
            *      the getCurrentPosition function and has three optional properties:
            *      enableHighAccuracy (true/false), timeout (number), maximumAge (number).
            */
            function getCurrentPositionByAPI(callback, scope, opts){
                navigator.geolocation.getCurrentPosition(
                    function(data){
                        callback.call(scope, {
                            success: true,
                            coords: {
                                latitude: data.coords.latitude,
                                longitude: data.coords.longitude,
                                accuracy: data.coords.accuracy,
                                altitude: data.coords.altitude,
                                altitudeAccuracy: data.coords.altitudeAccuracy,
                                heading: data.coords.heading,
                                speed: data.coords.speed
                            },
                            timestamp: data.timestamp,
                            source: "native"
                        });
                    },
                    function(error){
                        if (error.code === 1) {  //user denied permission, so don't do anything
                            callback.call(scope, {
                                success: false,
                                denied: true
                            });
                        } else {    //try Geo IP Lookup instead
                            getCurrentPositionByGeoIP(callback,scope);
                        }
                    },
                    opts
                    );
            }

            /*(intentionally not documented)
            * Tries to get the current position by using the IP address.
            * @param callback {Function} The callback function to call when the
            *      request is complete. The object passed into the request has
            *      four properties: success (true/false), coords (an object),
            *      timestamp, and source ("native" or "pidgets.geoip").
            * @param scope {Object} (Optional) The this value for the callback function.
            * @param opts {Object} (Optional) The PositionOptions object passed to
            *      the getCurrentPosition function and has three optional properties:
            *      enableHighAccuracy (true/false) which is ingored, timeout (number),
            *      maximumAge (number) passed to YQL request as maxAge URL-query param.
            */
            function getCurrentPositionByGeoIP(callback, scope, opts){

                opts = opts || {};
                var params = Y.Lang.isNumber(opts.maximumAge) ?
                {
                    _maxage: opts.maximumAge
                } : {};

                Y.jsonp("http://freegeoip.net/json/?callback={callback}", {
                    on: {
                        success: function(response){

                            if (response.error){
                                callback.call(scope, {
                                    success: false
                                });
                            } else {
                                callback.call(scope, {
                                    success: true,
                                    coords: {
                                        latitude: parseFloat(response.latitude),
                                        longitude: parseFloat(response.longitude),
                                        accuracy: Infinity    //TODO: Figure out better value
                                    },
                                    timestamp: +new Date(),
                                    source: "freegeoip.net"
                                });
                            }
                        },
                        failure: function(){
                            callback.call(scope, {
                                success: false
                            });
                        },
                        timeout: function(){
                            callback.call(scope, {
                                success: false
                            });
                        }
                    },
                    timeout: opts.timeout
                }, params);
            }
        }

    }, {
        NAME : GEONAME,
        ATTRS : {}
    });
    M.format_gps = M.format_gps || {}; // This line use existing name path if it exists, otherwise create a new one.
    // This is to avoid to overwrite previously loaded module with same name.
    M.format_gps.init_geo = function() { // 'config' contains the parameter values

        return new GEO();
    };
}, '@VERSION@', {
    requires:['yql']
});
