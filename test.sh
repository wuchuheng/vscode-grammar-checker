#!/bin/zsh

# Loop 100 times
successfulCount=0
faildCount=0
for ((i = 0; i < 100; i++)); do
  output=$(pnpm run test:ai)
  if [[ $? -eq 0 ]]; then
    successfulCount=$((successfulCount + 1))
  else
    faildCount=$((faildCount + 1))
    echo "${output}" | n
  fi
  # Print the output
  echo "${output}"

  sleep 1
done

echo "successfulCount: ${successfulCount}; faildCount: ${faildCount}"
