const alph = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function randomString(length = 8) {
    let outp = "";
    while (outp.length < length) {
        outp += alph[Math.floor(Math.random() * alph.length)];
    }
    return outp;
}
