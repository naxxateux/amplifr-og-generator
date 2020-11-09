<img width="100" height="100" align="right" alt="Amplifr logo" src="https://amplifr.com/logo.png" />

# Amplifr OG Generator App

The service generates images with user data, sets images as og:image in 
templates and returns both image and template by request. Used for sharing 
unique results of tests, calculations, etc.

## Install :hatching_chick:

1. You need the latest [Node.js](https://nodejs.org/en/)
   and [Yarn](https://yarnpkg.com/en/docs/install).

2. Run the following command:

   ```sh
   $ yarn install
   ```

## Start :hatched_chick:

   ```sh
   $ yarn start
   ```

## Tests 🙈

Execute `npx jest` or `npx jest --coverage` to run all tests

## Endpoints 🦊

// TODO

## How it works :microscope:

// TODO

## Deploy :rocket:

### Automated

```shell
git push origin master:releases
```

The process can be viewed via [CircleCI dashboard](https://circleci.com/gh/evilmartians/workflows/amplifr-og-generator)

### Manual

Preparations:

1. Get the access to GCR (ask `@ops` in Slack if you don't have it yet)
2. [Install Google Cloud SDK](https://cloud.google.com/sdk/install)
3. [Authorize Cloud SDK tools](https://cloud.google.com/sdk/docs/authorizing)
4. Run `gcloud auth configure-docker` to configrue your docker client

Building & pushing an image:

```shell
docker build -t gcr.io/amplifr.com/amplifr/amplifr-og-generator:$(git rev-parse HEAD) .
docker push gcr.io/amplifr.com/amplifr/amplifr-og-generator:$(git rev-parse HEAD)
```

Deploy:

*`helm upgrade` should be invoked from repository's root.*

```shell
helm upgrade -n og-generator og-generator ./helm-chart --wait --reuse-values --set image.tag=$(git rev-parse HEAD)
```

Make sure you did not make any commits between `docker build` and `helm upgrade`. Otherwise you will use a different SHA sum for deploy which is absent on GCR.

### Releases history

```shell
helm history -n og-generator og-generator
```

### :rotating_light: Rollback

Pick a [release number](#releases-history) you want to roll back to and run the following command:

```shell
helm rollback --wait -n og-generator og-generator RELEASE_NUMBER
```

### "Both deploy and then rollback went wrong" situation


There is a possibility that a faulty deploy and rollback may ruin a default rollback routine.

In that case you will have to rollback with a different command.

```shell
kubectl rollout undo -n og-generator og-generator deployment.apps/og-generator
```

### Scale

*`helm upgrade` should be invoked from repository's root.*

```shell
helm upgrade -n og-generator og-generator ./helm-chart --reuse-values --set replicas=2
```
