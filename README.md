# testiculate

Testiculate is a small service which ingests your JUnit reports and provides aggregate views over them.

## Views

### Home / Source view

The home page displays a list of all the collated sources, typically repository names.

### Results view

The results view aggregates information from all test reports for that source.  
It provides a simple pass/fail graph for the last 30 days of data, grouped by day of execution.  
Additionally, it provides an analysis of flaky tests.

### Tests view

The tests view analyses all executions of a given source for the past 30 days.  
It lists the 

## Uploading Test Reports

Test reports are uploaded with the `PUT /tests/{id}/{group}/{build}` endpoint.  
The path parameters identify different scopes, using nomenclature familiar to CI pipelines.

`{id}` can specify a repository name, or some other identifier for the 'source' of the execution.

`{group}` allows you to group a set of executions against a PR number, branch, or any other key. Often this is master, where tests are expected to always pass.

`{build}` then specified the iteration of that grouping, e.g. a build number or timestamp


## Limitations

testiculate offers no authentication, either on the front or backend.
