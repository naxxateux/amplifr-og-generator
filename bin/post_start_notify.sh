#!/bin/bash

/usr/bin/curl -X POST --data-urlencode \
"payload={\"channel\": \"#${SLACK_CHANNEL_POST_START}\", \"username\": \"${PAYLOAD_TYPE}_${SLACK_BOT_NAME_POST_START}\", \"text\": \"with version *${IMAGE_VERSION}* as *${HOSTNAME}*\"}" \
https://hooks.slack.com/services/${SLACK_TOKEN}
