import needle from "needle"
const clientId = "BF9B692281566FB5A8EF6B0C16AFE0F193129041AB1671F876D42A39523035E0"
const token = "4C77EC5CC8A92A7A3A8021AFDBB6AF016CE12E0E1EA90A934EC0BBA4D98887F44001B37AE2451BADD40D98A2B0428A810BFCF97C33B6B91B647585287DCEADF851E9904B2D12C3930E2F75509F146CB83D861C9A9795CA6D23511B3FD5D259C178C6E90F1547A7E523674AF546F232D9E138D4C7625105C2AC9188FC8A40B706"
const accessToken = "4100118083597946.06E9F00A3EDD041F03424BFA1A4603B87FDDA4038F4DA0E5D3BFF5E9875313D07B32717D22AD22466504939EF477D08FF728853E03B2AC710473A63647AB41ECE2B187AB11016280EF1A9E61A0ACCD954B6D96F521E59679D6D59DEF6E98AE2BA9766F454B794CA1F44A946B26466E636B60FB2ECBF74A41241ECE58153455D1"

const scopes = [
    "account-info",
    "operation-history",
    "operation-details",
    "payment",
    "payment-shop",
    "payment-p2p",
]

const postDataAuthorize = {
    client_id: clientId,
    response_type: "code",
    redirect_uri: "https://t.me/YourAiChatbot",
    scope: scopes
}

needle.post('https://yoomoney.ru/oauth/authorize', postDataAuthorize, (err, resp) => {
    console.log(resp.body) // выводим ответ.
})