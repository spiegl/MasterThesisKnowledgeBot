#!/bin/bash

nodejs cognitiveModels/transformMetaUtterances.js
nodejs cognitiveModels/enhanceCognitiveModelWithData.js
nodejs data/createQueryCacheFile.js
