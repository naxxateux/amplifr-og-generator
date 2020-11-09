{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "og-generator.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Template to generate secrets for a private Docker repository for K8s to use
*/}}
{{- define "og-generator.imagePullSecret" }}
{{- printf "{\"auths\": {\"%s\": {\"auth\": \"%s\"}}}" .Values.imageCredentials.registry (printf "%s:%s" .Values.imageCredentials.username .Values.imageCredentials.password | b64enc) | b64enc }}
{{- end }}

{{/*
Template for variables to use in deployments.
*/}}
{{- define "envVariables" -}}
{{- $release := .Release -}}
{{- range $key, $val := .Values.envSecrets }}
- name: {{ $key | snakecase | upper | quote }}
  value: {{ $val | quote }}
{{- end }}
{{ end -}}
