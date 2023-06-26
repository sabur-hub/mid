import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'
import { removeFile } from './utils.js'
import { initCommand, processTextToChat, INITIAL_SESSION } from './openai.js'


const description = 'a cat sitting on a table';
const size = [512, 512];
const imageUrl = await openai.generateImage(description, size);
console.log(imageUrl);