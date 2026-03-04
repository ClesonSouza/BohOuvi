function sleep(ms) {
    //Promise e uma promessa que espera o tempo passar e depois que passa tem o resolve que quer dizer q a promessa foi concluída
    return new Promise(resolve => setTimeout(resolve, ms)); 
}

//passa o titulo por três estágios um remove caracteres inválidos, depois os emojis e por fim os espaços vazios
function clearTitle(title){
    return title.replace(/[<>:"/.\-@♪,\\|?*]+/g, ' ')//Esse g e para remover todos da string
    .replace(/[\p{Emoji}]/gu, '')//Aqui o gu o g faz a mesma coisa mas com adição do u para lidar com emojis também
    .trim();
}

module.exports = { sleep, clearTitle};