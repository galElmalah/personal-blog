#!/bin/bash
set -e

# Enable debug logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >&2
}

log "Script started"
log "Working directory: $(pwd)"

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

log "Iterations requested: $1"

# Check dependencies
log "Checking dependencies..."
if ! command -v claude &> /dev/null; then
  log "ERROR: 'claude' command not found in PATH"
  log "PATH: $PATH"
  exit 1
fi
log "claude found at: $(which claude)"

if ! command -v jq &> /dev/null; then
  log "ERROR: 'jq' command not found"
  exit 1
fi
log "jq found at: $(which jq)"

# Check prompt file
if [ ! -f "prompt.md" ]; then
  log "ERROR: prompt.md not found in current directory"
  log "Contents of current directory:"
  ls -la >&2
  exit 1
fi
log "prompt.md found ($(wc -c < prompt.md) bytes)"

# jq filter to extract streaming text from assistant messages
stream_text='select(.type == "assistant").message.content[]? | select(.type == "text").text // empty | gsub("\n"; "\r\n") | . + "\r\n\n"'

# jq filter to extract final result
final_result='select(.type == "result").result // empty'

# Read prompt once before the loop
log "Reading prompt.md..."
prompt=$(cat prompt.md)
log "Prompt loaded (${#prompt} characters)"

for ((i=1; i<=$1; i++)); do
  echo "---------------------------------------- Iteration $i ----------------------------------------"
  
  tmpfile=$(mktemp)
  log "Created tmpfile: $tmpfile"
  trap "log 'Cleaning up $tmpfile'; rm -f $tmpfile" EXIT

  log "Starting claude command..."
  
  # Run claude and capture exit status
  set +e
  claude \
    --verbose \
    --print \
    --output-format stream-json \
    --dangerously-skip-permissions \
    "$prompt" \
  2> >(while read line; do log "claude stderr: $line"; done) \
  | grep --line-buffered '^{' \
  | tee "$tmpfile" \
  | jq --unbuffered -rj "$stream_text"
  
  pipe_status=("${PIPESTATUS[@]}")
  set -e
  
  log "Pipeline exit statuses: claude=${pipe_status[0]} grep=${pipe_status[1]} tee=${pipe_status[2]} jq=${pipe_status[3]}"
  
  if [ "${pipe_status[0]}" -ne 0 ]; then
    log "ERROR: claude command failed with exit code ${pipe_status[0]}"
  fi

  log "tmpfile size: $(wc -c < "$tmpfile") bytes"
  log "tmpfile lines: $(wc -l < "$tmpfile")"
  
  if [ ! -s "$tmpfile" ]; then
    log "WARNING: tmpfile is empty!"
    log "Attempting to show last 20 lines of raw output..."
  else
    log "First 500 chars of tmpfile:"
    head -c 500 "$tmpfile" >&2
    echo "" >&2
  fi

  log "Extracting result from tmpfile..."
  result=$(jq -r "$final_result" "$tmpfile" 2>&1) || {
    log "ERROR: jq failed to parse tmpfile"
    log "jq error: $result"
    continue
  }
  
  log "Result length: ${#result} characters"
  if [ -n "$result" ]; then
    log "Result preview (first 200 chars): ${result:0:200}"
  else
    log "Result is empty"
  fi

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    log "Found COMPLETE promise!"
    echo "Ralph complete after $i iterations."
    exit 0
  else
    log "COMPLETE promise not found, continuing to next iteration..."
  fi
done

log "All $1 iterations completed without finding COMPLETE promise"