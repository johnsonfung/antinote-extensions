/**
 * Console Polyfill for JavaScriptCore
 * Provides console.log, console.error, and console.warn functionality
 * that bridges to native Swift logging handlers.
 *
 * This polyfill handles:
 * - Variadic arguments (any number of arguments)
 * - Object serialization (via JSON.stringify)
 * - Fallback to String() for non-serializable objects
 * - Joining multiple arguments with spaces
 */

console = {
    log: function() {
        var parts = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg === 'object' && arg !== null) {
                try {
                    parts.push(JSON.stringify(arg));
                } catch (e) {
                    parts.push(String(arg));
                }
            } else {
                parts.push(String(arg));
            }
        }
        __nativeLog(parts.join(' '));
    },
    error: function() {
        var parts = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg === 'object' && arg !== null) {
                try {
                    parts.push(JSON.stringify(arg));
                } catch (e) {
                    parts.push(String(arg));
                }
            } else {
                parts.push(String(arg));
            }
        }
        __nativeError(parts.join(' '));
    },
    warn: function() {
        var parts = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg === 'object' && arg !== null) {
                try {
                    parts.push(JSON.stringify(arg));
                } catch (e) {
                    parts.push(String(arg));
                }
            } else {
                parts.push(String(arg));
            }
        }
        __nativeWarn(parts.join(' '));
    }
};
