import axios from 'axios'
 export async function chatMidGen(ctx, tmp) {
    var data = JSON.stringify({
        "msg": tmp,
        "ref": "",
        "webhookOverride": ""
    });

    var config = {
        method: 'post',
        url: 'https://api.thenextleg.io/v2/imagine',
        headers: {
            'Authorization': 'Bearer 4b693017-bf67-47f6-906e-f4f2c497c835',
            'Content-Type': 'application/json'
        },
        data: data
    };
     let msgId = "";
    try {
        await axios(config)
            .then(function (response) {
                msgId = response.data.messageId;
            })
            .catch(function (error) {
                console.log(error);
            });
    }catch (e){
        console.log("Request Error!")
    }
    return msgId;
}
