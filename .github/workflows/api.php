name: "TVC SPORT!"

on:
  workflow_dispatch:
  schedule:
    - cron: '*/10 * * * *'
    
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '7.4'
          
      - name: Execute PHP script
        run: |
          php api.php
          git config --global user.email "yebekhe@gmail.com"
          git config --global user.name "yebekhe"
          git config credential.helper store
          git add -A
          git commit -m "🚀 Stream URLs Updates - $(TZ='Asia/Tehran' date '+%Y-%m-%d %H:%M:%S')"
          git push
