#!/bin/bash

nodejs cognitiveModels/transformUtterancesMeta.js
nodejs cognitiveModels/enhanceCognitiveModelWithData.js
nodejs data/createQueryCacheFile.js
