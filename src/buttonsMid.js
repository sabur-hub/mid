import axios from "axios";
import {chatMidGen2} from './apiMedGiveImgFromUUU.js'

export async function buttons(ctx, button, btnMesId) {
    var data = JSON.stringify({
        "button": button,
        "buttonMessageId": btnMesId,
        "ref": "",
        "webhookOverride": ""
    });

    var config = {
        method: 'post',
        url: 'https://api.thenextleg.io/v2/button',
        headers: {
            'Authorization': 'Bearer 4b693017-bf67-47f6-906e-f4f2c497c835',
            'Content-Type': 'application/json'
        },
        data: data
    };

    let msId = null;
    let msg = null;
    try {
        await axios(config)
            .then(function (response) {
                msId = response.data.messageId
            })
            .catch(function (error) {
                console.log(error);
            });

        msg = await chatMidGen2(ctx, msId);
    }catch (e){
        console.log("Request Error!")
    }
    return msg
}

