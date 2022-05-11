export class SearchResult {
    public readonly imageUrl: string;
    public readonly title: string;
    public readonly siteUrl: string;

    public constructor(imageUrl: string, title: string, siteUrl: string) {
        this.imageUrl = imageUrl;
        this.title = title;
        this.siteUrl = siteUrl;
    }
}

export class ImageSearch {
    private static readonly _apiKey = "AIzaSyAJhEuo0_VTzt3bXcNYKOdXSC5hMJ6b2Z8";
    private static readonly _searchEngineID = "edfb26c41430b8e2b";

    private constructor() { /**/ }

    public static async fatch(query: string): Promise<SearchResult[]> {
        const response = await fetch(
            "https://www.googleapis.com/customsearch/v1" +
            `?key=${encodeURIComponent(ImageSearch._apiKey)}` +
            `&cx=${encodeURIComponent(ImageSearch._searchEngineID)}` +
            `&q=${encodeURIComponent(query)}`
        );
        const json = await response.json();
        const results = json.items
            .filter((item: any) => item.pagemap && item.pagemap.cse_thumbnail && 1 <= item.pagemap.cse_thumbnail.length)
            .map((item: any) => {
                return new SearchResult(
                    item.pagemap.cse_thumbnail[0].src,
                    item.title,
                    item.link
                );
            });

        return results;
    }
}
