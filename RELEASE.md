# 0.1.2

- Fix proxied requests with a JSON/urlencoded body hanging: the global bodyParser consumed the request stream before http-proxy forwarded it, so PUT/POST bodies never reached the upstream service. Re-stream the parsed body on proxyReq.

# 0.1.1

- Fix slow container startup: exclude node_modules from chown in entrypoint

# 0.1.0

- Added an API to manually register a service
- Implemented an HTTP ping to check if a registered service is alive
- Improved the API for listing registered services

# 0.0.2

- Handle json parameters on service label parameters
- Added an api to list running services with their parameters
- ServiceWatcher store container environment variables
- Add a scope to the service label parameters allowing to search for a specific scope

# 0.0.1

- Initial release
