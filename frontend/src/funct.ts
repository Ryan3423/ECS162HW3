export async function getApiKey() {
    const res = await fetch('/api/key');
    const data = await res.json();
    return data.apiKey;
}

  //create functions to add the articles in each section
export function createHeader(ID: HTMLElement | null, article: any){
    let newHeading = document.createElement("h1");
    newHeading.textContent = article.headline.main;
    ID?.appendChild(newHeading);
}

export function createImg(ID: HTMLElement | null, article: any){
    let newImg = document.createElement("img");
    newImg.src = article.multimedia.default.url;
    newImg.alt = article.multimedia.caption;
    newImg.classList.add("respImg");
    ID?.appendChild(newImg);
}

export function createP(ID: HTMLElement | null, article: any){
    let newPara = document.createElement("p");

    newPara.textContent = article.abstract;
    ID?.appendChild(newPara);
}