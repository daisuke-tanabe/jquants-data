#!/bin/bash
# .env ファイルへの Bash アクセスをブロックする
# .env.example / .env.sample / .env.template は許可

CMD=$(cat | jq -r '.tool_input.command // empty')

# .env を含み、かつ許可サフィックスではない場合にブロック
if [[ "$CMD" =~ \.env ]] && [[ ! "$CMD" =~ \.env\.(example|sample|template) ]]; then
  echo "Blocked: .env access is not allowed: $CMD" >&2
  exit 2
fi

exit 0