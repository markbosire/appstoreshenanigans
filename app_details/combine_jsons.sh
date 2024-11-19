#!/bin/bash

# Output file
master_json="master.json"

# Start the JSON array
echo "[" > "$master_json"

# Iterate over all JSON files in the folder
first=true
for file in *.json; do
  if [ "$file" != "$master_json" ]; then
    if [ "$first" = true ]; then
      first=false
    else
      # Add a comma to separate JSON objects
      echo "," >> "$master_json"
    fi
    # Append the content of the current JSON file
    cat "$file" >> "$master_json"
  fi
done

# End the JSON array
echo "]" >> "$master_json"

echo "All JSON files have been combined into $master_json."

