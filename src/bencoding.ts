const encodeString = (content: string): string => `${content.length}:${content}`;

const encodeInteger = (content: number): string => `i${content}e`;

const encodeList = (content: Array<string | number>): string => {
    if (!Array.isArray(content)) {
        throw new Error('the content to be encoded for a list have to be an array');
    }

    if (content.some(c => Array.isArray(c))) {
        throw new Error('content should\'nt be multidimensional array');
    }

    content = content.map(data => {
        switch (typeof data) {
            case 'string':
                return encodeString(data);
            case 'number':
                return encodeInteger(data);
            default:
                return '';
        }
    });

    return `l${content.join('')}e`;
}

const encodeDictionary = (content: any): string => {
    if (typeof content !== 'object' || Array.isArray(content) || content === null) {
        throw new Error('type of dictionary have to be an object');
    }

    const entries = Object.entries(content).map((e) => {
        const [key, value] = e;
        let entry = encodeString(key);

        switch (typeof value) {
            case 'object':
                return entry + encodeList(value as []);
            case 'number':
                return entry + encodeInteger(value as number);
            case 'string':
                return entry + encodeString(value as string);
        }
    });

    return `d${entries.join('')}e`;
}

export const encode = (
    type: 'dictionary' | 'integer' | 'list' | 'string',
    content: any,
) => {
    switch (type) {
        case 'string':
            return encodeString(content);
        case 'integer':
            return encodeInteger(content);
        case 'list':
            return encodeList(content);
        case 'dictionary':
            return encodeDictionary(content);
    }
}
