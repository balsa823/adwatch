#!/bin/sh

year=2010
while [ $year -le 2020 ]
do
  argument="Macbook pro $year"
  output_file="$year.json"
  
  echo "Executing node app/index.js with argument: $argument"
  node src/index.js "$argument"
  
  echo "Output saved to: $output_file"

  year=$((year + 1))
done
