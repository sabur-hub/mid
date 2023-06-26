import { Configuration, OpenAIApi } from 'openai'
import config from 'config'
import { createReadStream } from 'fs'
import axios from 'axios'
import {code} from "telegraf/format";
import {Markup} from "telegraf";
import {message} from "telegraf/filters";

export let UserDialogues = {};
export async function chatGen(ctx, textt) {
    try {
        const userId = ctx.from.id;
        const userMessage = textt;

        const userDialogue = UserDialogues[userId] || [];

        const messages = userDialogue.concat([{role: "user", content: userMessage}]);

        const response = await openaii.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: messages,
        });

        const modelReply = response.data.choices[0].message.content;
        ctx.reply(code(modelReply));
        UserDialogues[userId] = messages.concat([{role: 'assistant', content: modelReply}]);
    } catch (e) {
        console.log('Error while gpt chat', e.message)
    }
}

export async function transcription(filepath) {
    try {

        const response = await openaii.createTranscription(
            createReadStream(filepath),
            'whisper-1'
        )
        return response.data.text
    } catch (e) {
        console.log('Error while transcription', e.message)
    }
}

export async function generateIamge(message){
    try {
        const prompt = message
        const configuration = new Configuration({
            apiKey: config.get('OPENAI_KEY')
        });

        const openai = new OpenAIApi(configuration);

        const response = await openai.createImage({
            prompt: prompt,
            n: 4,
            size: "1024x1024",
        });
        return response.data.data;
    }catch (e){
        console.log("error!")
    }
}

export const INITIAL_SESSION = {
    messages: [],
}
export async function initCommand(ctx) {
    await ctx.replyWithPhoto({ source: './src/img/ker.png' });
    await ctx.reply('*Лучшие нейросети в твоём телефоне*\n' +
        '\n' +
        '— Задайте вопрос боту или запишите голосовое и получите быстрый ответ намного качественее чем Google\n' +
        '\n' +
        '— Введите ваш текст или код и бот проверит его на ошибки и выдаст правильный ответ\n' +
        '\n' +
        '— Сфотографируйте ваше задание или тест и бот вам выдаст решение за 1 минуту\n' +
        '\n' +
        '— Создайте уникальное изображение в 4к формате по вашему текстовому запросу\n' +
        '\n' +
        'И ещё сотни полезных функций с которыми бот справится всего за минуту🤖')
    const userId = ctx.from.id;
    if(!UserDialogues[userId]){
        UserDialogues[userId] = [];
    }
}

export async function newChatKer(ctx){
    const userId = ctx.from.id;
    UserDialogues[userId] = [];
    await ctx.reply('Начиналось новый диалог!')
}

export const configuration = new Configuration({
    apiKey: config.get('OPENAI_KEY')
});

export const openaii = new OpenAIApi(configuration);