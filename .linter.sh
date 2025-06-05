#!/bin/bash
cd /home/kavia/workspace/code-generation/noteease-17881-7d034cb5/noteease
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

