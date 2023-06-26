import {session, Telegraf, Markup} from 'telegraf'
import { message } from 'telegraf/filters'
import timeout, {TimeoutError} from 'p-timeout'
import {code, link} from 'telegraf/format'
import config from 'config'
import { ogg } from './ogg.js'
import { removeFile } from './utils.js'
import {chatMidGen} from './apiMed.js'
import {kerDown} from "./imgdownloader.js";
import {chatMidGen2} from './apiMedGiveImg.js'
import {buttons} from './buttonsMid.js'
import {buttonsVVV} from './buttonsMidVVVV.js'
import {buttonGetId} from './getButtonId.js'
import { initCommand, newChatKer, chatGen, transcription, generateIamge, INITIAL_SESSION } from './openai.js'
import path, {dirname, resolve} from "path";
import {fileURLToPath} from "url";
import fs, {createWriteStream} from "fs";
import axios from "axios";
import postgres from 'postgres'
const __dirname = dirname(fileURLToPath(import.meta.url))

const client = postgres('postgres://ksepissj:M8KoCbUXeX5NRLIJqvJ-WTJssfWVZvVH@mahmud.db.elephantsql.com/ksepissj',{
    host: "mahmud.db.elephantsql.com",
    port: 5432,
    database: "ksepissj",
    user: "ksepissj",
    password: "M8KoCbUXeX5NRLIJqvJ-WTJssfWVZvVH",
})

await client`
  CREATE TABLE IF NOT EXISTS usersAiBot(
  id serial PRIMARY KEY,
  user_id int,
  date_buy TIMESTAMP,
  date_ending TIMESTAMP,
  count_tokens int,
  count_queries int,
  tarif_plan text
  )
`

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

// говорим боту, чтобы он использовал session
bot.use(session())

// при вызове команды new и start бот регистрирует новую беседу,
// новый контекс
bot.command('start', initCommand)

let cpt = "Images are numbered from left to right, then from top to bottom\n" +
    "\n" +
    "U-Upscale\n" +
    "\n" +
    "V - Variations\n" +
    "\n" +
    "🔄 - New query\n" +
    "\n" +
    "Reset - back to prompt"
let msgId = null;

bot.on(message('text'), async (ctx) => {

        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('U1', 'U1'),
                Markup.button.callback('U2', 'U2'),
                Markup.button.callback('U3', 'U3'),
                Markup.button.callback('U4', 'U4'),
            ],
            [
                Markup.button.callback('V1', 'V1'),
                Markup.button.callback('V2', 'V2'),
                Markup.button.callback('V3', 'V3'),
                Markup.button.callback('V4', 'V4')
            ],
            [
                Markup.button.callback('🔄', 'button7'),
            ]
        ]);

        const tmp = ctx.message.text

        const cnt = 1
        const msg_id = ctx.message.from.id;
        try {
            const data = await client`SELECT COUNT(*) FROM usersAiBot where user_id = ${msg_id}`
            if(data[0]["count"] == 1){
                const currentDate = new Date();
                const values_now = [currentDate]
                const data1 = await client`SELECT COUNT(*) FROM usersAiBot where user_id = ${msg_id} and ${values_now} <= date_ending`
                if(data1[0]["count"] == 1){
                    const data2 = await client`SELECT COUNT(*) FROM usersAiBot where user_id = ${msg_id} and ${values_now} <= date_ending and ${cnt} <= count_queries`
                    if(data2[0]["count"] == 1) {

                        await ctx.reply(code('Сообщение принял. Жду ответ от сервера...'))
                        try {

                            msgId = await chatMidGen(ctx, tmp);

                            await ctx.reply("Запрос отправлен!");
                            console.log(msgId);

                            let imageUr = await chatMidGen2(ctx, msgId);
                            await kerDown(imageUr, msgId);

                            //await ctx.replyWithPhoto({ source: `img/${msgId}.png` },   Extra.markup(keyboard ));
                            await ctx.telegram.sendPhoto(ctx.message.chat.id, {
                                source: `img/${msgId}.png`,
                                caption: cpt,
                                reply_markup: keyboard
                            })

                            await ctx.reply(tmp);
                            await client`UPDATE usersAiBot SET count_queries = count_queries - ${cnt} WHERE user_id = ${msg_id}`;
                        } catch (e) {
                            if (e instanceof TimeoutError) {
                                // Обработка ошибки TimeoutError
                                console.log("Время выполнения превысило ограничение");
                                await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
                            } else {
                                // Обработка других ошибок
                                console.log("Произошла другая ошибка:", e);
                                await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
                            }
                        }
                    }else {
                        const data = await client`SELECT * FROM usersAiBot where user_id = ${ctx.from.id}`
                        await ctx.reply(code('У вас нет доступа!\nОформите подписку!'))
                        // Отправляем текст и кнопку в ответ на нажатие
                        await ctx.reply(`🔹 Ваша текущая подписка: ${data[0]["tarif_plan"]}\n` +
                            `🔹 Сегодня Токенов ChatGPT осталось: ${data[0]["count_tokens"]} \n` +
                            `🔹 Сегодня у вас осталось ${data[0]["count_queries"]} запроса Midjorney\n` +
                            `\n` +
                            `Окончание подписки — ${data[0]["date_ending"]}\n` +
                            '\n' +
                            'Реферальная программа: \n' +
                            'Ваша ссылка: 0\n' +
                            'Количество рефералов: 0', {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: 'Оформить/продлить подписку',
                                            url: "https://t.me/BotForHackatonbot"
                                        }
                                    ]
                                ]
                            }
                        });
                    }

                }
                else{
                    const data = await client`SELECT * FROM usersAiBot where user_id = ${ctx.from.id}`
                    await ctx.reply(code('У вас нет доступа!\nОформите подписку!'))
                    // Отправляем текст и кнопку в ответ на нажатие
                    await ctx.reply(`🔹 Ваша текущая подписка: ${data[0]["tarif_plan"]}\n` +
                        `🔹 Сегодня Токенов ChatGPT осталось: ${data[0]["count_tokens"]} \n` +
                        `🔹 Сегодня у вас осталось ${data[0]["count_queries"]} запроса Midjorney\n` +
                        `\n` +
                        `Окончание подписки — ${data[0]["date_ending"]}\n` +
                        '\n' +
                        'Реферальная программа: \n' +
                        'Ваша ссылка: 0\n' +
                        'Количество рефералов: 0', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Оформить/продлить подписку',
                                        url: "https://t.me/BotForHackatonbot"
                                    }
                                ]
                            ]
                        }
                    });

                }
            }
        } catch (e){
            await ctx.reply(code("Повторите запрос позже!"))
            console.log(`Error while image message`, e.message)
        }

})

// Обработчик нажатия на кнопку
await bot.action('U1', async (ctx) => {
    try {
        await ctx.reply('U1');
        let buttonId = await buttonGetId(ctx, msgId);
        //U1
        console.log(buttonId)
        let U1 = await buttons(ctx, "U1", buttonId);
        console.log(U1)
        await kerDown(U1, `${buttonId}U1`);
        await ctx.replyWithDocument({ source: `img/${buttonId}U1.png`});
    }catch (e){
        if (e instanceof TimeoutError) {
            // Обработка ошибки TimeoutError
            console.log("Время выполнения превысило ограничение");
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        } else {
            // Обработка других ошибок
            console.log("Произошла другая ошибка:", e);
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        }
    }
});

// Обработчик нажатия на кнопку
await bot.action('U2', async(ctx) => {
    try {
        await ctx.reply('U2');
        let buttonId = await buttonGetId(ctx, msgId);
        //U2
        console.log(buttonId)
        let U2 = await buttons(ctx, "U2", buttonId);
        console.log(U2)
        await kerDown(U2, `${buttonId}U2`);
        await ctx.replyWithDocument({source: `img/${buttonId}U2.png`});
    }catch(e){
        if (e instanceof TimeoutError) {
            // Обработка ошибки TimeoutError
            console.log("Время выполнения превысило ограничение");
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        } else {
            // Обработка других ошибок
            console.log("Произошла другая ошибка:", e);
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        }
    }
});

// Обработчик нажатия на кнопку
await bot.action('U3', async(ctx) => {
    try {
        await ctx.reply('U3');
        let buttonId = await buttonGetId(ctx, msgId);
        //U1
        console.log(buttonId)
        let U3 = await buttons(ctx, "U3", buttonId);
        console.log(U3)
        await kerDown(U3, `${buttonId}U3`);
        await ctx.replyWithDocument({source: `img/${buttonId}U3.png`});
    }catch (e){
        if (e instanceof TimeoutError) {
            // Обработка ошибки TimeoutError
            console.log("Время выполнения превысило ограничение");
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        } else {
            // Обработка других ошибок
            console.log("Произошла другая ошибка:", e);
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        }
    }
});

// Обработчик нажатия на кнопку
await bot.action('U4', async(ctx) => {
    try {
        await ctx.reply('U4');
        let buttonId = await buttonGetId(ctx, msgId);
        //U1
        console.log(buttonId)
        let U4 = await buttons(ctx, "U4", buttonId);
        console.log(U4)
        await kerDown(U4, `${buttonId}U4`);
        await ctx.replyWithDocument({source: `img/${buttonId}U4.png`});
    }catch (e){
        if (e instanceof TimeoutError) {
            // Обработка ошибки TimeoutError
            console.log("Время выполнения превысило ограничение");
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        } else {
            // Обработка других ошибок
            console.log("Произошла другая ошибка:", e);
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        }
    }
});

// Обработчик нажатия на кнопку
await bot.action('V1', async(ctx) => {
    try {
        await ctx.reply('V1');

        let keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('U1', 'U1'),
                Markup.button.callback('U2', 'U2'),
                Markup.button.callback('U3', 'U3'),
                Markup.button.callback('U4', 'U4'),
            ],
            [
                Markup.button.callback('V1', 'V1'),
                Markup.button.callback('V2', 'V2'),
                Markup.button.callback('V3', 'V3'),
                Markup.button.callback('V4', 'V4')
            ],
            [
                Markup.button.callback('🔄', 'button7'),
            ]
        ]);

        let buttonId = await buttonGetId(ctx, msgId);

        msgId = await buttonsVVV(ctx, "V1", buttonId);
        await bot.telegram.sendPhoto(ctx.chat.id, {source: `img/${buttonId}V1.png`, caption: cpt}, keyboard)
        console.log(msgId);
    }catch (e){
        if (e instanceof TimeoutError) {
            // Обработка ошибки TimeoutError
            console.log("Время выполнения превысило ограничение");
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        } else {
            // Обработка других ошибок
            console.log("Произошла другая ошибка:", e);
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        }
    }
});

// Обработчик нажатия на кнопку
await bot.action('V2', async(ctx) => {
    try {
        await ctx.reply('V2');

        let keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('U1', 'U1'),
                Markup.button.callback('U2', 'U2'),
                Markup.button.callback('U3', 'U3'),
                Markup.button.callback('U4', 'U4'),
            ],
            [
                Markup.button.callback('V1', 'V1'),
                Markup.button.callback('V2', 'V2'),
                Markup.button.callback('V3', 'V3'),
                Markup.button.callback('V4', 'V4')
            ],
            [
                Markup.button.callback('🔄', 'button7'),
            ]
        ]);

        let buttonId = await buttonGetId(ctx, msgId);

        msgId = await buttonsVVV(ctx, "V2", buttonId);
        await bot.telegram.sendPhoto(ctx.chat.id, {source: `img/${buttonId}V2.png`, caption: cpt}, keyboard)
        console.log(msgId);
    }catch (e){
        if (e instanceof TimeoutError) {
            // Обработка ошибки TimeoutError
            console.log("Время выполнения превысило ограничение");
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        } else {
            // Обработка других ошибок
            console.log("Произошла другая ошибка:", e);
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        }
    }
});

// Обработчик нажатия на кнопку
await bot.action('V3', async(ctx) => {
    try {
        await ctx.reply('V3');

        let keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('U1', 'U1'),
                Markup.button.callback('U2', 'U2'),
                Markup.button.callback('U3', 'U3'),
                Markup.button.callback('U4', 'U4'),
            ],
            [
                Markup.button.callback('V1', 'V1'),
                Markup.button.callback('V2', 'V2'),
                Markup.button.callback('V3', 'V3'),
                Markup.button.callback('V4', 'V4')
            ],
            [
                Markup.button.callback('🔄', 'button7'),
            ]
        ]);

        let buttonId = await buttonGetId(ctx, msgId);

        msgId = await buttonsVVV(ctx, "V3", buttonId);
        await bot.telegram.sendPhoto(ctx.chat.id, {source: `img/${buttonId}V3.png`, caption: cpt}, keyboard)
        console.log(msgId);
    }catch (e){
        if (e instanceof TimeoutError) {
            // Обработка ошибки TimeoutError
            console.log("Время выполнения превысило ограничение");
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        } else {
            // Обработка других ошибок
            console.log("Произошла другая ошибка:", e);
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        }
    }
});

// Обработчик нажатия на кнопку
await bot.action('V4', async(ctx) => {
    try {
        await ctx.reply('V4');

        let keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('U1', 'U1'),
                Markup.button.callback('U2', 'U2'),
                Markup.button.callback('U3', 'U3'),
                Markup.button.callback('U4', 'U4'),
            ],
            [
                Markup.button.callback('V1', 'V1'),
                Markup.button.callback('V2', 'V2'),
                Markup.button.callback('V3', 'V3'),
                Markup.button.callback('V4', 'V4')
            ],
            [
                Markup.button.callback('🔄', 'button7'),
            ]
        ]);

        let buttonId = await buttonGetId(ctx, msgId);

        ///let V4 = await buttonsVVV(ctx, "V4", buttonId);
        msgId = await buttonsVVV(ctx, "V4", buttonId);
        await bot.telegram.sendPhoto(ctx.chat.id, {source: `img/${buttonId}V4.png`, caption: cpt}, keyboard)
        console.log(msgId);
    }catch (e){
        if (e instanceof TimeoutError) {
            // Обработка ошибки TimeoutError
            console.log("Время выполнения превысило ограничение");
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        } else {
            // Обработка других ошибок
            console.log("Произошла другая ошибка:", e);
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        }
    }
});

await bot.action('button7', async(ctx) => {
    try {
        await ctx.reply('🔄');

        let keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('U1', 'U1'),
                Markup.button.callback('U2', 'U2'),
                Markup.button.callback('U3', 'U3'),
                Markup.button.callback('U4', 'U4'),
            ],
            [
                Markup.button.callback('V1', 'V1'),
                Markup.button.callback('V2', 'V2'),
                Markup.button.callback('V3', 'V3'),
                Markup.button.callback('V4', 'V4')
            ],
            [
                Markup.button.callback('🔄', 'button7'),
            ]
        ]);

        let buttonId = await buttonGetId(ctx, msgId);

        ///let V4 = await buttonsVVV(ctx, "V4", buttonId);
        msgId = await buttonsVVV(ctx, "🔄", buttonId);
        await bot.telegram.sendPhoto(ctx.chat.id, {source: `img/${buttonId}🔄.png`, caption: cpt}, keyboard)
        console.log(msgId);
    }catch (e){
        if (e instanceof TimeoutError) {
            // Обработка ошибки TimeoutError
            console.log("Время выполнения превысило ограничение");
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        } else {
            // Обработка других ошибок
            console.log("Произошла другая ошибка:", e);
            await ctx.telegram.sendMessage(ctx.chat.id, "МидЖерни не отвечает.\nПовторите поже!")
        }
    }
});

bot.launch()

