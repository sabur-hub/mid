import fs from "fs";
import axios from "axios";

export async function kerDown(fileUrl, msgId) {
    const fileName = `img/${msgId}.png`;

    try {
        if (fs.existsSync(fileName)) {
            console.log('Файл найден');
        } else {
            const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
            await fs.writeFileSync(fileName, response.data);
            console.log('Файл успешно скачан.');
        }
    } catch (error) {
        console.error(`Ошибка загрузки файла: ${error}`);
    }
}
