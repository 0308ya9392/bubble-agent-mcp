# Security policy

## Supported versions

Security fixes are released for the latest published version.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Email **alizhannurgazy@gmail.com** with:

- a concise description;
- reproduction steps;
- affected version;
- potential impact.

You should receive an acknowledgement within 72 hours.

## Credential handling

Bubble Agent MCP reads credentials from environment variables. Never commit `.env`, client configuration files containing live secrets, logs containing credentials, or screenshots exposing keys.

If a key is exposed, revoke it immediately in Bubble Agent and generate a replacement.

## Trust boundaries

This repository contains only the local MCP adapter. Collection providers, database credentials, private ranking logic, and infrastructure secrets stay in the hosted Bubble Agent backend.
