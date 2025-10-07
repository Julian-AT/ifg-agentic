const BASE_URL = "https://www.data.gv.at/"

export const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
    const url = new URL(`${BASE_URL}${path}`);

    console.log(url);


    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                url.searchParams.append(key, String(value));
            }
        }
    }

    return url.toString();
};

