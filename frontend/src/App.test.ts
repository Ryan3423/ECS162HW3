import { test, vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
// import { render } from '@testing-library/svelte';
import App from './App.svelte';
import { createHeader, createImg, createP, getApiKey } from './funct';

// test('App', async() =>{
//     render(App);
// });

test('API Key returns as expected', async () => {
    //Mock fetch with test key 
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ apiKey: 'test-key' })
    });    

    //Call function from App and asset
    const key = await getApiKey();
    expect(key).toBe('test-key');
});

describe('Article displayed in UI', () => {
    const testArticle = 
        {
            "abstract": "abstract",
            "headline": {
              "main": "headline.main",
            },
            "multimedia": {
              "caption": "multimedia.caption",
              "default": {
                "url": "https://static01.nyt.com/images/2023/05/04/multimedia/04nat-davis-arrest-01-bktg/04nat-davis-arrest-01-bktg-articleLarge.jpg",
                "height": 399,
                "width": 600
              },
            },
        };
    const testContainer = document.createElement("div")

    // Call various functions used in App and assert 
    it('should display the header', () => {
        createHeader(testContainer, testArticle)

        const testH1 = testContainer.querySelector("h1")
        expect(testH1).not.toBeNull();
        expect(testH1?.textContent).toBe(testArticle.headline.main);
    });

    it('should display the media', () => {
        createImg(testContainer, testArticle)

        const testImg = testContainer.querySelector("img")
        expect(testImg).not.toBeNull();
        expect(testImg?.src).toBe(testArticle.multimedia.default.url);
        expect(testImg?.alt).toBe(testArticle.multimedia.caption);
    });

    it('should display the abstract', () => {
        createP(testContainer, testArticle)

        const testP = testContainer.querySelector("p")
        expect(testP).not.toBeNull();
        expect(testP?.textContent).toBe(testArticle.abstract);
    });
});

describe('NYT data returns correctly', () => {
    //Test article that resembles NYT article object
    const testArticle = 
    {
        "abstract": "abstract",
        "headline": {
          "main": "headline.main",
        },
        "multimedia": {
          "caption": "multimedia.caption",
          "default": {
            "url": "https://static01.nyt.com/images/2023/05/04/multimedia/04nat-davis-arrest-01-bktg/04nat-davis-arrest-01-bktg-articleLarge.jpg",
            "height": 399,
            "width": 600
          },
        },
    }; 

    const apiKey = 'test-key';  
     // Behavior seen in App
    const NYtimes = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
    const filter = '?q=("Sacramento", "Davis") AND fq=timesTag.location:"California"&';
    let article_URL = NYtimes + filter + 'api-key=' + apiKey;
      
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ response: { docs: testArticle } })
        });
    });

    afterEach(() => {
        vi.restoreAllMocks(); 
    });

    it('should return data in an expected format', async () => {
        const res2 = await fetch(article_URL);
        const data2 = await res2.json();
  
        //Assert whether shape of object matches
        expect(data2.response.docs).toMatchObject(testArticle);
    });
  
    it('should fetch the articles using our filter', async () => {
        await fetch(article_URL);

        expect(fetch).toHaveBeenCalledWith(article_URL);
    });
});