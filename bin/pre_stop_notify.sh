#!/bin/bash

/usr/bin/curl -X POST --data-urlencode \
"payload={\"channel\": \"#${SLACK_CHANNEL_PRE_STOP}\", \"username\": \"${PAYLOAD_TYPE}_${SLACK_BOT_NAME_PRE_STOP}\", \"text\": \"in progress with version *${IMAGE_VERSION}* named *${HOSTNAME}*\"}" \
https://hooks.slack.com/services/${SLACK_TOKEN}
