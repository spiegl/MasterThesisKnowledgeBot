#!/bin/bash
cd .
cd cognitiveModels/ && nodejs enhanceCognitiveModelWithData.js

cd -
cd data/ && nodejs createQueryCacheFile.js