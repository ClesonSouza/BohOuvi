# BohOuvi

Projeto pessoal focado em criar um **player + downloader de músicas** com **alto nível de customização**.

Desenvolvi esse projeto para resolver problemas que eu tinha com players de música existentes, que muitas vezes eram **simples demais** ou **não possuíam as funcionalidades que eu procurava**.

A aplicação utiliza **React no frontend** e **Node.js no backend**.

![Tela inicial](/public/githubImgs/bohouvi-1.png)

---

# Funcionalidades

A aplicação possui **duas funcionalidades principais**:

1. **Download de playlists do YouTube**
2. **Reprodução das músicas baixadas**

---

# Download

O usuário insere o **link de uma playlist do YouTube** e define um **nome para ela**.

Após a confirmação, um **WebSocket do servidor envia atualizações em tempo real** sobre o progresso do download até a conclusão.

![Download](/public/githubImgs/bohouvi-2.png)

---

# Reprodução

A parte de reprodução possui diversas funções para **melhorar a experiência do usuário**, como:

- **Atualizar a playlist selecionada**

![Download](/public/githubImgs/bohouvi-4.png)

- **Alternar entre reprodução em ordem e modo aleatório**

![Download](/public/githubImgs/bohouvi-022.png)

- **Repetir a mesma música em loop**

![Download](/public/githubImgs/bohouvi-111.png)

- **Tocar uma música aleatória**

![Download](/public/githubImgs/bohouvi-8.png)

- **Scroll automático para a música selecionada**

![Download](/public/githubImgs/bohouvi-5.png)

- **Embaralhar a lista de músicas**

![Download](/public/githubImgs/bohouvi-7.png)

- **Adicionar músicas à fila de reprodução**

![Download](/public/githubImgs/bohouvi-13.png)

- **Adicionar músicas à lista de "não tocar"**

![Download](/public/githubImgs/bohouvi-14.png)

- **Resetar a playlist**, restaurando seu estado original e removendo: fila, lista de não tocar e embaralhamento

![Download](/public/githubImgs/bohouvi-6.png)

Além disso, o player possui **funcionalidades padrão**, como:

- **Play / Pause**
- **Avançar e retroceder músicas**
- **Buscar músicas ou artistas**
- **Excluir músicas ou playlists**

![Download](/public/githubImgs/bohouvi-3.png)

---

# O que aprendi

Durante o desenvolvimento deste projeto, aprofundei meus conhecimentos em:

- **Estruturação de servidores Node.js**
- **Comunicação em tempo real utilizando WebSocket**
- **Criação de APIs REST**
- **Web scraping com Puppeteer**
- **Download de músicas utilizando yt-dlp**
- **Conversão de arquivos de áudio com FFmpeg**
- **Stream de arquivos utilizando Node.js**
- **Desenvolvimento de interfaces com React**

Além disso, o projeto me permitiu **entender melhor a organização de aplicações full-stack**, integração entre frontend e backend e manipulação de arquivos no servidor.

---

# Como utilizar

1. Na **pasta principal**, execute: `npm install`
2. Na **pasta server**, execute novamente: `npm install`
3. Volte para a **pasta principal** e execute: `npm start`


Após isso, a aplicação estará **pronta para uso**.

---

# Observações

- É necessário ter o **Node.js instalado** na máquina.
- O link da playlist do YouTube deve estar no formato: https://www.youtube.com/playlist?list=CodigoDaPlaylist
- **Na primeira execução**, o comando `npm start` pode demorar um pouco devido ao **download de dependências e criação das pastas necessárias**.

## Ferramentas utilizadas

Este projeto utiliza algumas ferramentas open source:

- **yt-dlp** – utilizado para realizar o download de áudios do YouTube  
  https://github.com/yt-dlp/yt-dlp

- **FFmpeg** – utilizado para conversão e processamento de arquivos de áudio  
  https://ffmpeg.org/

## Aviso

Este projeto foi desenvolvido para **fins educacionais e pessoais**.

A aplicação utiliza ferramentas open source para download de conteúdo.  
O usuário é responsável por respeitar os **termos de uso do YouTube** e as **leis de direitos autorais** ao utilizar este software.

Este projeto **não incentiva a violação de copyright**.