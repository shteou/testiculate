# How to develop on Testiculate

## Architecture

Testiculate is comprised of a golang backend API and static frontend.

### Backend API


### Frontend

The frontend is written in 'vanilla' JavaScript/CSS (read: no fiddling with webpack or CSS transpilers).

JavaScript is plain ES6 using the native module system, and the CSS utilises flexbox.  
(Mithril.js)[https://mithril.js.org/] is used for the frontend framework, without any JSX support.

```
static/
  js/
    components/  - Re-usable Mithril.JS components
    views/       - Page oriented view components
    util.js      - Helper functions, e.g. groupBy
  index.html     - html wrapper and JS bootstrap
  main.css       - All styles
```

## Building

### Building locally

Local development can be accomplished by building the static binary or building the Dockerfile.

`docker build . -t testiculate:1.0.9-SNAPSHOT && docker run -it --rm -p 8080 testiculate:1.0.9-SNAPSHOT`  
or  
`go build cmd/testiculate/testiculate.go && ./testiculate`


### Running on Kubernetes

You can deploy the application to a Kubernetes cluster with the following steps.

1. Build and push the image to your registry
2. Update the chart's `values.yaml` repository and tag fields
3. (Optional) Set the ingress to enabled and update the host accordingly
4. `helm upgrade -i testiculate chart/`

Now navigate to the ingress, or use `kubectl port-forward` and navigate to the service on localhost.

### Populating with data

Once running you'll need to add some data. Data is ingested by PUT to the `/tests/:name/:stream/:id` endpoint, passing a JUnit XML document.

A python script has been provided which ingests a few hundred executions for 15 or so different sources.  
The script will use a random set of 10 test cases, with occasional failures and an elevated failure rate for the 5th test case (emulating a flaky test).

1. python -m venv venv
2. source venv/bin/activate
3. pip install -r requests
4. python populate.py localhost:8080

The script will fork for each source name, and upload a series of builds across several streams.  
These roughly correspond to repositories, pull requests, and monotonic build IDs.
