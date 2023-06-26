import axios from 'axios'

export async function chatMidGen2(ctx, msgId) {
    var data;
    let ur = `https://api.thenextleg.io/v2/message/${msgId}?expireMins=2`;
    console.log(ur)
    //ur = 'https://api.thenextleg.io/v2/message/qzFGL8J3MB4P7yDJhW5I?expireMins=2';

    var config = {
        method: 'get',
        url: ur,
        headers: {
            'Authorization': 'Bearer 4b693017-bf67-47f6-906e-f4f2c497c835',
            'Content-Type': 'application/json'
        },
        data : data
    };

    let img = null;
    let bl = true;
    let last = 0;
    let neww;
    await sleep(1000);
    try {
    while (bl) {
        await axios(config)
            .then(function (response) {
                neww = response.data.progress;
                if (last != neww) {
                    //ctx.telegram.editMessageText(ctx.message.chat.id, editPro.message_id, editPro.message_id, neww + "%")
                    console.log(neww)
                }
                last = neww;
                if (last == 100) {
                    img = response.data.response.imageUrl;
                    //ctx.telegram.editMessageText(ctx.message.chat.id, editPro.message_id, editPro.message_id, 100 + "%")
                    //ctx.telegram.sendMessage(ctx.message.chat.id, "finished!")
                    //ctx.reply("Finished!");
                    bl = false
                }
            })
            .catch(function (error) {
                console.log("errorAxios");
            });
    }
    }catch (e){
        console.log("Request Error!")
    }


    return img;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}