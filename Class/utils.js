import CryptoJS from 'crypto-js';
import dotenv from "dotenv";


class Utils {
    encryptData(data) {
        const key = process.env.APP_KEY;
        return CryptoJS.AES.encrypt(data, key).toString();
    }
    decrypt(data) {
        const key = process.env.APP_KEY;
        const bytes = CryptoJS.AES.decrypt(data, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

}
const util = new Utils()
export default util;