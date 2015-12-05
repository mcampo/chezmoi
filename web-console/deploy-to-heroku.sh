#!/usr/bin/env bash
cd ..
git push heroku-web-console `git subtree split --prefix web-console master`:master --force

