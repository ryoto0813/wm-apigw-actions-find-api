# webMethods API Gateway "Find API" action for Github Actions

With this action you can query webMethods API Gateway to find the details of an API project. The step output from this action provides information you can use in following steps in your GitHub Actions workflow job.

**Table of contents**

- [Inputs](#inputs)
- [Outputs](#outputs)
- [Example](#example)
- [Questions and Issues](#questions-and-issues)
- [License Summary](#license-summary)


<!-- tocstop -->


## Inputs

|Input|Required|Description|
|-|-|-|
|apigw-url|yes|The url of your (master) API Gateway instance.|
|apigw-user|yes|The API Gateway user to execute this action with.|
|apigw-password|yes|The password for the API Gateway user to execute this action with.|
|api-name|yes|The name of the API project to find.|
|api-version|yes|The version of the API project to look up.| 
|fail-if-not-found|no|Fail the job if the API could not be found? Returns empty outputs if the API project could not be found. Defaults to false.|

## Outputs

|Output|Description|
|-|-|
|api-id|The unique identifier of the API project.|
|api-name|The name of the API project. This will be the same as the input, but added here for convenient access in subsequent steps in the workflow.|
|api-version|The version of the API project. This will be the same as the input, but added here for convenient access in subsequent steps in the workflow.|
|api-type|The type of the API project.|
|api-is-active|Indicates whether the API project is currently active.|

## Example

Following example workflow illustrates how to use the action in your CICD configuration.

``` yaml
name: 'Example workflow'
on: [push]
jobs:
  find-and-print-api-info:
    runs-on: ubuntu-latest
    steps: 
      - uses: jiridj/wm-apigw-actions-find-api@v1
        id: find-api
        with: 
          apigw-url: ${{ secrets.APIGW_URL }}
          apigw-user: ${{ secrets.APIGW_USERNAME }}
          apigw-password: ${{ secrets.APIGW_PASSWORD }}
          api-name: 'Swagger Petstore'
          api-version: '1.0.6'
      - name: print-api-info
        run: |
          echo "ID      = ${{ steps.find-api.outputs.api-id }}"
          echo "Name    = ${{ steps.find-api.outputs.api-name }}"
          echo "Version = ${{ steps.find-api.outputs.api-version }}"
          echo "Type    = ${{ steps.find-api.outputs.api-type }}"
          echo "Active  = ${{ steps.find-api.outputs.api-is-active }}"
```

More examples can be found in this repository's [GitHub workflows](https://github.com/jiridj/wm-apigw-actions-find-api/tree/main/.github/workflows).

## Questions and Issues

Any questions or issues can be raised via the repository [issues](https://github.com/jiridj/wm-apigw-actions-find-api/issues).

## License Summary

This code is made avialable under the [MIT license](./LICENSE).