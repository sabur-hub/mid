import postgres from 'postgres'

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
const currentDate = new Date(); // Текущая дата
const endingDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // Текущая дата + 30 дней
const formattedEndingDate = endingDate;
const values_now = [currentDate]
const values_end = [formattedEndingDate]

//await client`INSERT INTO usersAiBot ${ client([{ user_id: 1, date_buy: values_now, date_ending: values_end, count_tokens: 0, count_queries: 0, tarif_plan: null}]) }`
//const data = await client`SELECT * FROM usersAiBot where user_id = ${1328946981}`
const data = await client`SELECT COUNT(*) FROM usersAiBot where user_id = ${1980848617}`
if(data[0]["count"] == 1){
    const currentDate = new Date();
    const values_now = [currentDate]
    const data1 = await client`SELECT COUNT(*) FROM usersAiBot where user_id = ${1980848617} and ${values_now} <= date_ending`
    if(data1[0]["count"] == 1){
        const cnt = 5;
        const data2 = await client`SELECT COUNT(*) FROM usersAiBot where user_id = ${1980848617} and ${values_now} <= date_ending and ${cnt} <= count_tokens`
        if(data2[0]["count"] == 1) {
            await client`UPDATE usersAiBot SET count_tokens = count_tokens - ${cnt} WHERE user_id = ${1980848617}`;
        }
    }
}
console.log(data[0])